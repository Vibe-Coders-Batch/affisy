import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'

const apply = process.argv.includes('--apply')
const assets = [
  {
    slug: 'one-chefs-knife-or-knife-set',
    filename: 'knife-or-set-editorial.webp',
    alt: 'Editorial illustration of a conventional chef’s knife on an oak board with a small knife block behind it',
    caption:
      'AI-generated editorial illustration of generic kitchen knives. It does not depict the Matsato Osuren or a product test.',
  },
  {
    slug: 'plan-three-plant-based-dinners',
    filename: 'three-plant-based-dinners-editorial.webp',
    alt: 'Editorial illustration of a chickpea rice bowl, tomato pasta and vegetable wrap using overlapping ingredients',
    caption:
      'AI-generated meal-planning illustration. These dishes are illustrative examples, not tested recipes from the Complete Plant-Based Cookbook.',
  },
]
const payload = await getPayload({ config })
try {
  const posts = await payload.find({
    collection: 'posts',
    where: { slug: { in: assets.map(({ slug }) => slug) } },
    draft: true,
    depth: 0,
    limit: 2,
    overrideAccess: true,
  })
  const header = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true })
  for (const asset of assets) {
    const post = posts.docs.find(({ slug }) => slug === asset.slug)
    if (!post || post._status !== 'published')
      throw new Error(`Expected published article, preserve any pending draft: ${asset.slug}`)
  }
  console.log(
    JSON.stringify(
      {
        mode: apply ? 'apply' : 'preview',
        images: assets,
        reviewLinkCorrection: header.navItems?.some(({ link }) => link.url === '/search?q=reviews'),
      },
      null,
      2,
    ),
  )
  if (apply) {
    await mkdir('.local-backups', { recursive: true })
    await writeFile(
      `.local-backups/before-guide-images-${Date.now()}.json`,
      JSON.stringify({ posts: posts.docs, header }, null, 2),
      { mode: 0o600 },
    )
    for (const asset of assets) {
      const post = posts.docs.find(({ slug }) => slug === asset.slug)!
      let media = (
        await payload.find({
          collection: 'media',
          where: { filename: { equals: asset.filename } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
        })
      ).docs[0]
      if (!media) {
        media = await payload.create({
          collection: 'media',
          overrideAccess: true,
          context: { disableRevalidate: true },
          filePath: path.resolve('public/images', asset.filename),
          data: { alt: asset.alt },
        })
      }
      if (!media.url || !(await fetch(media.url, { method: 'HEAD' })).ok)
        throw new Error(`Image upload is not reachable: ${asset.filename}`)
      const current = await payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
        depth: 0,
        overrideAccess: true,
      })
      if (current.updatedAt !== post.updatedAt) throw new Error(`Concurrent edit: ${post.slug}`)
      await payload.update({
        collection: 'posts',
        id: post.id,
        draft: false,
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          heroImage: media.id,
          meta: { ...post.meta, image: media.id },
          imageCaption: asset.caption,
        },
      })
      const saved = await payload.findByID({
        collection: 'posts',
        id: post.id,
        depth: 1,
        draft: false,
        overrideAccess: false,
      })
      if (
        typeof saved.heroImage !== 'object' ||
        saved.heroImage?.id !== media.id ||
        saved._status !== 'published'
      )
        throw new Error(`Image assignment failed: ${post.slug}`)
      console.log(
        JSON.stringify({
          slug: post.slug,
          image: media.filename,
          bytes: media.filesize,
          imageURL: media.url,
        }),
      )
    }
    // The incoming query is now preserved by Search, so this nav link must match "review".
    if (header.navItems?.some(({ link }) => link.url === '/search?q=reviews')) {
      const current = await payload.findGlobal({ slug: 'header', depth: 0, overrideAccess: true })
      if (current.updatedAt !== header.updatedAt)
        throw new Error('Concurrent header edit; preserve it.')
      await payload.updateGlobal({
        slug: 'header',
        overrideAccess: true,
        context: { disableRevalidate: true },
        data: {
          navItems: header.navItems.map((item) =>
            item.link.url === '/search?q=reviews'
              ? { ...item, link: { ...item.link, url: '/search?q=review' } }
              : item,
          ),
        },
      })
      console.log('Corrected Reviews navigation to the matching search query.')
    }
  }
} finally {
  await payload.destroy()
}
process.exit(0)
