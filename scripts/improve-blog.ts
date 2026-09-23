import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  improveReview,
  reviewImprovements,
  supportingGuides,
  supportingPost,
} from '@/content/blog-improvements'

// Repository content is the proposal; --apply saves CMS drafts, never publishes.
const apply = process.argv.includes('--apply')
const payload = await getPayload({ config })
try {
  const slugs = [...Object.keys(reviewImprovements), ...supportingGuides.map(({ slug }) => slug)]
  const [latest, published, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { slug: { in: slugs } },
      draft: true,
      depth: 0,
      limit: 10,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'posts',
      where: { slug: { in: slugs } },
      draft: false,
      depth: 0,
      limit: 10,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'categories',
      where: { slug: { equals: 'kitchen' } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    }),
  ])
  const kitchen = categories.docs[0]
  if (!kitchen) throw new Error('Kitchen category missing.')
  const updates = Object.keys(reviewImprovements).map((slug) => {
    const post = latest.docs.find((doc) => doc.slug === slug)
    if (!post) throw new Error(`Review missing: ${slug}`)
    if (post._status !== 'published') {
      // Never replace an editor’s pending draft on a repeated run.
      return { post, data: null }
    }
    return { post, data: improveReview(post) }
  })
  const additions = supportingGuides.filter(
    (guide) => !latest.docs.some((doc) => doc.slug === guide.slug),
  )
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'save drafts' : 'read-only preview',
        updateReviews: updates.filter(({ data }) => data).map(({ post }) => post.slug),
        preserveExistingDrafts: updates.filter(({ data }) => !data).map(({ post }) => post.slug),
        createGuides: additions.map(({ slug }) => slug),
      },
      null,
      2,
    ),
  )
  if (apply) {
    await mkdir('.local-backups', { recursive: true })
    const backup = `.local-backups/blog-before-improvements-${Date.now()}.json`
    await writeFile(
      backup,
      JSON.stringify({ latest: latest.docs, published: published.docs }, null, 2),
      { mode: 0o600 },
    )
    console.log(`Backup: ${backup}`)
    for (const { post, data } of updates) {
      if (!data) continue
      // Check for edits made after the initial read before writing a version.
      const current = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
        depth: 0,
        overrideAccess: true,
      })
      if (current.updatedAt !== post.updatedAt)
        throw new Error(`Concurrent edit to ${post.slug}; retry after reviewing.`)
      const saved = await payload.update({
        collection: 'posts',
        id: post.id,
        draft: true,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: { ...data, _status: 'draft' },
      })
      if (saved.review?.affiliateURL !== post.review?.affiliateURL)
        throw new Error('Affiliate URL changed unexpectedly.')
      console.log(`Saved review draft: ${post.slug}`)
    }
    for (const guide of additions) {
      const related = published.docs.find((post) => post.slug === guide.reviewSlug)
      await payload.create({
        collection: 'posts',
        draft: true,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          ...supportingPost(guide),
          categories: [kitchen.id],
          relatedPosts: related ? [related.id] : [],
        },
      })
      console.log(`Created guide draft: ${guide.slug}`)
    }
    const after = await payload.find({
      collection: 'posts',
      where: { slug: { in: slugs } },
      draft: false,
      depth: 0,
      limit: 10,
      overrideAccess: false,
    })
    // Legacy media blocks without stored IDs receive a new editor-only ID on each read.
    const publicSnapshot = (docs: typeof after.docs) =>
      JSON.parse(
        JSON.stringify(
          [...docs].sort((a, b) => a.id.localeCompare(b.id)),
          (key, value) =>
            key === 'fields' && value?.blockType ? { ...value, id: undefined } : value,
        ),
      )
    if (!isDeepStrictEqual(publicSnapshot(after.docs), publicSnapshot(published.docs)))
      throw new Error('Public documents differ from the snapshot; inspect the backup.')
    console.log('Verified: published documents unchanged; new copy is saved as drafts only.')
  }
} finally {
  await payload.destroy()
}
