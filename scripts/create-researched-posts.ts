import { mkdir, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import type { Post } from '@/payload-types'
import { loadResearchedPosts } from '@/content/researched-posts'
import { articleDetails, nodeText } from '@/utilities/article'

const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--apply')) {
  throw new Error(
    'Usage: node --import tsx scripts/create-researched-posts.ts [--apply]. There is no publish option.',
  )
}
const apply = args.includes('--apply')
const proposals = await loadResearchedPosts()

console.log(
  JSON.stringify(
    {
      mode: apply ? 'create missing CMS drafts' : 'offline preview; CMS not contacted',
      articles: proposals.map(({ article, data, file }) => ({
        slug: data.slug,
        title: data.title,
        file,
        status: data._status,
        category: article.categorySlug,
        relatedSlugs: article.relatedSlugs,
        bodyWords: nodeText(data.content.root).split(/\s+/).filter(Boolean).length,
        headings: articleDetails(data.content).headings.length,
        sources: data.review?.sources?.length || 0,
        affiliateLink: data.review?.affiliateURL ? 'configured' : 'not configured',
      })),
    },
    null,
    2,
  ),
)

if (apply) {
  // Keep the default preview completely offline, including CMS/environment initialization.
  await import('dotenv/config')
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  const publicSnapshot = (docs: Post[]) =>
    JSON.parse(
      JSON.stringify(
        [...docs].sort((a, b) => a.id.localeCompare(b.id)),
        // Old Lexical media blocks can acquire editor-only IDs when read.
        (key, value) =>
          key === 'fields' && value?.blockType ? { ...value, id: undefined } : value,
      ),
    ) as unknown
  const readPublic = async () => {
    const result = await payload.find({
      collection: 'posts',
      draft: false,
      overrideAccess: false,
      where: { _status: { equals: 'published' } },
      depth: 0,
      pagination: false,
      limit: 1000,
    })
    if (result.totalDocs > result.docs.length)
      throw new Error('Public snapshot was truncated; no safe comparison is available.')
    return result.docs
  }
  try {
    const [existing, categories, publicBefore] = await Promise.all([
      payload.find({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        depth: 0,
        pagination: false,
        limit: proposals.length,
        where: { slug: { in: proposals.map(({ data }) => data.slug) } },
      }),
      payload.find({
        collection: 'categories',
        overrideAccess: true,
        depth: 0,
        pagination: false,
        limit: 10,
        where: { slug: { in: ['kitchen', 'buying-guides'] } },
      }),
      readPublic(),
    ])
    const additions = proposals.filter(
      ({ data }) => !existing.docs.some((post) => post.slug === data.slug),
    )
    for (const { article } of additions) {
      if (!categories.docs.some((category) => category.slug === article.categorySlug)) {
        throw new Error(`Required category is missing: ${article.categorySlug}`)
      }
    }
    if (additions.length) {
      await mkdir('.local-backups', { recursive: true })
      const backup = `.local-backups/researched-posts-before-${Date.now()}.json`
      await writeFile(
        backup,
        JSON.stringify({ existing: existing.docs, published: publicBefore }, null, 2),
        { mode: 0o600 },
      )
      console.log(`Backup: ${backup}`)
    }
    for (const post of existing.docs)
      console.log(`Preserved existing article: ${post.slug} (${post._status})`)
    const created: string[] = []
    for (const { article, data } of additions) {
      // Recheck immediately before creation to preserve an article added during this run.
      const current = await payload.find({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        depth: 0,
        limit: 1,
        where: { slug: { equals: data.slug } },
      })
      if (current.docs.length) {
        console.log(`Preserved concurrently created article: ${data.slug}`)
        continue
      }
      const category = categories.docs.find((item) => item.slug === article.categorySlug)!
      const saved = await payload.create({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          ...data,
          _status: 'draft',
          categories: [category.id],
          relatedPosts: publicBefore
            .filter((post) => article.relatedSlugs.includes(post.slug))
            .map(({ id }) => id),
        },
      })
      const verified = await payload.findByID({
        collection: 'posts',
        id: saved.id,
        draft: true,
        overrideAccess: true,
        depth: 0,
      })
      if (
        verified._status !== 'draft' ||
        verified.slug !== data.slug ||
        verified.title !== data.title ||
        nodeText(verified.content.root) !== nodeText(data.content.root) ||
        (verified.review?.affiliateURL || '') !== (data.review?.affiliateURL || '')
      ) {
        throw new Error(`Saved draft verification failed: ${data.slug}`)
      }
      created.push(verified.slug)
      console.log(`Created and verified draft: ${verified.slug} (${verified.id})`)
    }
    const publicAfter = await readPublic()
    if (!isDeepStrictEqual(publicSnapshot(publicAfter), publicSnapshot(publicBefore))) {
      throw new Error(
        'Public documents changed during the import; inspect the backup before continuing.',
      )
    }
    console.log(
      JSON.stringify({ created, publicDocumentsUnchanged: true, published: false }, null, 2),
    )
  } finally {
    await payload.destroy()
  }
}

// Payload/Next may retain background handles after destroy in a standalone script.
process.exit(0)
