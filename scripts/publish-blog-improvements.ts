import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'
import { reviewImprovements, supportingGuides } from '@/content/blog-improvements'
import { nodeText } from '@/utilities/article'

// Publish only this reviewed batch. Run before the deployment that refreshes static pages.
const apply = process.argv.includes('--apply')
const slugs = [...supportingGuides.map(({ slug }) => slug), ...Object.keys(reviewImprovements)]
const payload = await getPayload({ config })
try {
  const latest = await payload.find({
    collection: 'posts',
    where: { slug: { in: slugs } },
    draft: true,
    depth: 0,
    limit: 10,
    overrideAccess: true,
  })
  const posts = slugs.map((slug) => {
    const post = latest.docs.find((post) => post.slug === slug)
    if (!post) throw new Error(`Missing prepared article: ${slug}`)
    const expected = reviewImprovements[slug]
    if (
      expected &&
      (!nodeText(post.content.root).includes(expected.section.title) ||
        post.review?.summary !== expected.review.summary)
    ) {
      throw new Error(`Prepared review differs from the approved batch: ${slug}`)
    }
    return post
  })
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'publish' : 'preview',
        articles: posts.map(({ slug, _status }) => ({ slug, status: _status })),
      },
      null,
      2,
    ),
  )
  if (apply) {
    const publicBefore = await payload.find({
      collection: 'posts',
      where: { slug: { in: slugs } },
      draft: false,
      depth: 0,
      limit: 10,
      overrideAccess: false,
    })
    await mkdir('.local-backups', { recursive: true })
    const backup = `.local-backups/blog-before-publication-${Date.now()}.json`
    await writeFile(
      backup,
      JSON.stringify({ drafts: posts, published: publicBefore.docs }, null, 2),
      { mode: 0o600 },
    )
    console.log(`Backup: ${backup}`)
    for (const post of posts) {
      const current = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
        depth: 0,
        overrideAccess: true,
      })
      if (current.updatedAt !== post.updatedAt)
        throw new Error(`Concurrent edit to ${post.slug}; inspect before publishing.`)
      const companion = supportingGuides.find((guide) => guide.reviewSlug === post.slug)
      const companionPost = companion && posts.find((item) => item.slug === companion.slug)
      const related = (post.relatedPosts || []).map((item) =>
        typeof item === 'string' ? item : item.id,
      )
      if (companionPost && !related.includes(companionPost.id)) related.push(companionPost.id)
      await payload.update({
        collection: 'posts',
        id: post.id,
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          categories: post.categories,
          heroImage: post.heroImage,
          imageCaption: post.imageCaption,
          authors: post.authors,
          meta: post.meta,
          relatedPosts: related,
          review: post.review,
          publishedAt: post.publishedAt || new Date().toISOString(),
          _status: 'published',
        },
      })
      const visible = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: false,
        depth: 0,
        overrideAccess: false,
      })
      if (
        visible._status !== 'published' ||
        nodeText(visible.content.root) !== nodeText(post.content.root) ||
        visible.review?.affiliateURL !== post.review?.affiliateURL ||
        visible.review?.summary !== post.review?.summary
      ) {
        throw new Error(`Publication verification failed: ${post.slug}`)
      }
      console.log(`Published and verified: ${post.slug}`)
    }
  }
} finally {
  await payload.destroy()
}
process.exit(0)
