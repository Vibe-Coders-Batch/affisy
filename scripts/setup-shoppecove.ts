import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import config from '@payload-config'
import { getPayload } from 'payload'
import { shoppecoveGuides } from '@/content/shoppecove-guides'

// Deliberately separate from seed:affiliate, which erases existing collections.
// Dry run by default. Apply creates missing draft guides and updates only the known template homepage.
if (!process.argv.includes('--apply')) {
  console.log(
    'Dry run: create missing kitchen, sleep-comfort, and buying-guides categories; add three research drafts; update the AffiliatePath template homepage. Existing posts and custom homepages are preserved. Run with --apply to save these changes.',
  )
  process.exit(0)
}
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const { docs: homes } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    depth: 0,
    limit: 1,
  })
  const home = homes[0]
  if (home) {
    const directory = '.local-backups'
    await mkdir(directory, { recursive: true })
    await writeFile(`${directory}/home-${Date.now()}.json`, JSON.stringify(home, null, 2))
  }
  const categories: Record<string, string> = {}
  for (const [slug, title] of [
    ['kitchen', 'Kitchen & home'],
    ['sleep-comfort', 'Sleep & comfort'],
    ['buying-guides', 'Buying guides'],
  ]) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    const category =
      existing.docs[0] ||
      (await payload.create({ collection: 'categories', data: { slug, title }, context }))
    categories[slug] = category.id
  }
  for (const { topic, ...guide } of shoppecoveGuides) {
    const existing = await payload.find({
      collection: 'posts',
      where: { slug: { equals: guide.slug } },
      limit: 1,
      depth: 0,
      draft: true,
    })
    if (existing.docs.length) {
      console.log(`Preserved existing post: ${guide.slug}`)
      continue
    }
    await payload.create({
      collection: 'posts',
      data: { ...guide, categories: [categories[topic]], _status: 'draft' },
      draft: true,
      context,
    })
    console.log(`Created draft: ${guide.slug}`)
  }
  if (
    home?.layout.some(
      (block) =>
        block.blockType === 'affiliateHome' &&
        block.heroTitle === 'Learn Affiliate Marketing. Build Your Freedom.',
    )
  ) {
    await payload.update({
      collection: 'pages',
      id: home.id,
      context,
      data: {
        meta: {
          title: 'Buying guides for a more thoughtful everyday | ShoppeCove',
          description:
            'Explore practical product research and buying guides for your kitchen, home, and everyday comfort.',
          image: null,
        },
        layout: home.layout.map((block) =>
          block.blockType === 'affiliateHome'
            ? {
                ...block,
                heroTitle: 'Good finds.\nBetter everyday living.',
                heroDescription:
                  'Thoughtful buying guides and a closer look at the things you bring home. Find what fits your life, before you buy.',
                heroCTA: { label: 'Explore the journal', url: '/posts' },
                heroImage: null,
                featuredPost: null,
                categoryCards: [],
              }
            : block,
        ),
      },
    })
    console.log(
      'Updated template homepage. Previous homepage saved in .local-backups; Payload version history is also retained.',
    )
  } else console.log('Custom homepage preserved.')
} finally {
  await payload.destroy()
}

// Payload plugins may retain timers after the database connection is closed.
process.exit(0)
