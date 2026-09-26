import { mkdir, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { researchedArticles } from '@/content/researched-posts'
import type { Post } from '@/payload-types'

const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--apply')) {
  throw new Error(
    'Usage: node --import tsx scripts/update-researched-hoplinks.ts [--apply]. No create or publish option is available.',
  )
}
const apply = args.includes('--apply')
const configured = researchedArticles.flatMap(({ slug, review }) => {
  const affiliateURL = review.affiliateURL
  if (!affiliateURL) return []
  const url = new URL(affiliateURL)
  if (
    affiliateURL !== affiliateURL.trim() ||
    affiliateURL.includes('\\') ||
    url.protocol !== 'https:' ||
    !url.hostname.endsWith('.hop.clickbank.net') ||
    url.username ||
    url.password ||
    url.port
  ) {
    throw new Error(`Invalid configured ClickBank HopLink: ${slug}`)
  }
  // Keep the supplied query string unchanged, including its leading ?&.
  return [{ slug, affiliateURL }]
})
if (new Set(configured.map(({ slug }) => slug)).size !== configured.length) {
  throw new Error('Duplicate configured slugs; refusing an ambiguous update.')
}

console.log(
  JSON.stringify(
    {
      mode: apply
        ? 'update affiliate URLs on existing drafts'
        : 'offline preview; CMS not contacted',
      articles: researchedArticles.map(({ slug, review }) => ({
        slug,
        action: review.affiliateURL ? 'update existing draft only' : 'skip: no configured URL',
        affiliateURL: review.affiliateURL || null,
      })),
      createsPosts: false,
      publishesPosts: false,
    },
    null,
    2,
  ),
)

if (apply && configured.length) {
  // Preview never loads environment variables, Payload or its database configuration.
  await import('dotenv/config')
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  const normalize = (value: unknown): unknown =>
    JSON.parse(
      JSON.stringify(value, (key, item) =>
        // Match create-researched-posts: old Lexical blocks acquire editor-only IDs on read.
        key === 'fields' && item?.blockType ? { ...item, id: undefined } : item,
      ),
    )
  const publicSnapshot = (docs: Post[]) =>
    normalize([...docs].sort((a, b) => a.id.localeCompare(b.id)))
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
    if (result.totalDocs > result.docs.length) {
      throw new Error('Public snapshot was truncated; refusing to update drafts.')
    }
    return result.docs
  }
  const assertEligible = (post: Post, slug: string, affiliateURL: string) => {
    if (post.slug !== slug || post._status !== 'draft') {
      throw new Error(`Expected an existing draft with the exact slug: ${slug}`)
    }
    if (post.review?.affiliateURL && post.review.affiliateURL !== affiliateURL) {
      throw new Error(`Unexpected existing affiliate URL; preserving it: ${slug}`)
    }
  }

  try {
    const [existing, publicBefore] = await Promise.all([
      payload.find({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        depth: 0,
        pagination: false,
        limit: configured.length + 1,
        where: { slug: { in: configured.map(({ slug }) => slug) } },
      }),
      readPublic(),
    ])
    if (existing.totalDocs > existing.docs.length) {
      throw new Error('Draft lookup was truncated; refusing an ambiguous update.')
    }
    // Validate the complete batch before writing a backup or changing any document.
    const targets = configured.map(({ slug, affiliateURL }) => {
      const matches = existing.docs.filter((post) => post.slug === slug)
      if (matches.length !== 1) {
        throw new Error(`Expected exactly one existing draft, found ${matches.length}: ${slug}`)
      }
      const post = matches[0]
      assertEligible(post, slug, affiliateURL)
      if (publicBefore.some((published) => published.id === post.id)) {
        throw new Error(`A public version exists; refusing to modify this article: ${slug}`)
      }
      return { post, affiliateURL }
    })
    const pending = targets.filter(
      ({ post, affiliateURL }) => post.review?.affiliateURL !== affiliateURL,
    )
    let backup: string | undefined
    if (pending.length) {
      await mkdir('.local-backups', { recursive: true, mode: 0o700 })
      backup = `.local-backups/researched-hoplinks-before-${Date.now()}.json`
      await writeFile(
        backup,
        JSON.stringify(
          {
            createdAt: new Date().toISOString(),
            updates: pending.map(({ post, affiliateURL }) => ({
              id: post.id,
              slug: post.slug,
              affiliateURL,
            })),
            drafts: targets.map(({ post }) => post),
            published: publicBefore,
          },
          null,
          2,
        ),
        { mode: 0o600, flag: 'wx' },
      )
      console.log(`Backup: ${backup}`)
    }
    const updated: string[] = []
    const unchanged: string[] = []
    for (const { post, affiliateURL } of targets) {
      // Recheck the latest draft immediately before updating; never merge stale review data.
      const current = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
        overrideAccess: true,
        depth: 0,
      })
      assertEligible(current, post.slug, affiliateURL)
      if (
        current.updatedAt !== post.updatedAt ||
        !isDeepStrictEqual(normalize(current), normalize(post))
      ) {
        throw new Error(`Draft changed during this run; preserving the newer edit: ${post.slug}`)
      }
      if (current.review?.affiliateURL === affiliateURL) {
        unchanged.push(post.slug)
        continue
      }
      const review = { ...current.review, affiliateURL }
      // This is trusted maintenance. Keep the filter guards as well as the pre-write recheck.
      const result = await payload.update({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        overrideLock: false,
        depth: 0,
        limit: 1,
        context: { disableRevalidate: true },
        where: {
          and: [
            { id: { equals: current.id } },
            { slug: { equals: current.slug } },
            { _status: { equals: 'draft' } },
            { updatedAt: { equals: current.updatedAt } },
          ],
        },
        data: { review },
      })
      if (result.errors.length || result.docs.length !== 1 || result.docs[0].id !== current.id) {
        throw new Error(`Guarded update failed for ${post.slug}; inspect ${backup}.`)
      }
      const verified = await payload.findByID({
        collection: 'posts',
        id: current.id,
        draft: true,
        overrideAccess: true,
        depth: 0,
      })
      const expected = { ...current, review }
      if (
        verified._status !== 'draft' ||
        verified.review?.affiliateURL !== affiliateURL ||
        !isDeepStrictEqual(
          normalize({ ...verified, updatedAt: current.updatedAt }),
          normalize(expected),
        )
      ) {
        throw new Error(
          `Draft fields changed beyond its affiliate URL: ${post.slug}; inspect ${backup}.`,
        )
      }
      updated.push(verified.slug)
      console.log(`Updated and verified draft affiliate URL: ${verified.slug}`)
    }
    const publicAfter = await readPublic()
    if (!isDeepStrictEqual(publicSnapshot(publicAfter), publicSnapshot(publicBefore))) {
      throw new Error(`Public documents changed during this run; inspect ${backup || 'the CMS'}.`)
    }
    console.log(
      JSON.stringify(
        { updated, unchanged, publicDocumentsUnchanged: true, published: false },
        null,
        2,
      ),
    )
  } finally {
    await payload.destroy()
  }
}

// Payload/Next may retain background handles after destroy in a standalone script.
process.exit(0)
