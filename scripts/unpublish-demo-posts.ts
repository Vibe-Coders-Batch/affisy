import 'dotenv/config'

import { mkdir, writeFile } from 'node:fs/promises'
import config from '@payload-config'
import { getPayload } from 'payload'

const demoSlugs = [
  'start-affiliate-marketing-for-beginners',
  'free-traffic-strategies',
  'evaluate-affiliate-programs',
] as const

const productSlugs = ['complete-plant-based-cookbook-review', 'matsato-osuren-review'] as const
const apply = process.argv.includes('--apply')
const payload = await getPayload({ config })

try {
  const demos = (
    await payload.find({
      collection: 'posts',
      where: { slug: { in: [...demoSlugs] } },
      draft: true,
      depth: 0,
      limit: demoSlugs.length,
      pagination: false,
    })
  ).docs

  const foundSlugs = new Set(demos.map(({ slug }) => slug))
  const missingSlugs = demoSlugs.filter((slug) => !foundSlugs.has(slug))
  if (missingSlugs.length) throw new Error(`Missing demo posts: ${missingSlugs.join(', ')}`)

  const publishedDemos = demos.filter(({ _status }) => _status === 'published')
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'dry-run',
        demoPosts: demos.map(({ id, slug, title, _status }) => ({ id, slug, title, status: _status })),
        willUnpublish: publishedDemos.map(({ slug }) => slug),
      },
      null,
      2,
    ),
  )

  if (!apply) process.exit(0)

  await mkdir('.local-backups', { recursive: true })
  await writeFile(
    `.local-backups/demo-posts-before-unpublish-${Date.now()}.json`,
    JSON.stringify(demos, null, 2),
  )

  for (const post of publishedDemos) {
    await payload.update({
      collection: 'posts',
      id: post.id,
      draft: false,
      data: { _status: 'draft' },
      context: { disableRevalidate: true },
    })
  }

  const savedDemos = await Promise.all(
    demos.map(({ id }) =>
      payload.findByID({ collection: 'posts', id, draft: true, depth: 0 }),
    ),
  )
  const publicDemos = await payload.find({
    collection: 'posts',
    where: { slug: { in: [...demoSlugs] } },
    draft: false,
    overrideAccess: false,
    depth: 0,
    pagination: false,
  })
  const publicProducts = await payload.find({
    collection: 'posts',
    where: { slug: { in: [...productSlugs] } },
    draft: false,
    overrideAccess: false,
    depth: 0,
    pagination: false,
  })

  if (savedDemos.some(({ _status }) => _status !== 'draft') || publicDemos.docs.length) {
    throw new Error('Demo post visibility verification failed.')
  }
  if (publicProducts.docs.length !== productSlugs.length) {
    throw new Error('Expected product articles are no longer both public.')
  }

  console.log(
    JSON.stringify(
      {
        demoPosts: savedDemos.map(({ slug, _status }) => ({ slug, status: _status })),
        publicProductPosts: publicProducts.docs.map(({ slug, _status }) => ({
          slug,
          status: _status,
        })),
      },
      null,
      2,
    ),
  )
} finally {
  await payload.destroy()
}

process.exit(0)
