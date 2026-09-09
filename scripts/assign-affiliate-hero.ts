import 'dotenv/config'

import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload, type File as PayloadFile } from 'payload'

const payload = await getPayload({ config })
const heroPath = path.resolve('public/affiliate-hero.png')
const data = fs.readFileSync(heroPath)
const filename = path.basename(heroPath)

const existingMedia = await payload.find({
  collection: 'media',
  depth: 0,
  limit: 1,
  where: { filename: { equals: filename } },
})

const heroMedia =
  existingMedia.docs[0] ||
  (await payload.create({
    collection: 'media',
    data: { alt: 'A bright workspace with a laptop showing a growth chart' },
    file: {
      data,
      mimetype: 'image/png',
      name: filename,
      size: data.byteLength,
    } satisfies PayloadFile,
  }))

const pages = await payload.find({
  collection: 'pages',
  depth: 0,
  limit: 1,
  where: { slug: { equals: 'home' } },
})

const homePage = pages.docs[0]

if (!homePage) {
  throw new Error('The home page was not found.')
}

const layout = homePage.layout.map((block) =>
  block.blockType === 'affiliateHome' ? { ...block, heroImage: heroMedia.id } : block,
)

await payload.update({
  collection: 'pages',
  id: homePage.id,
  context: { disableRevalidate: true },
  data: { layout },
})

console.log(`HERO_MEDIA_ID=${heroMedia.id}`)
console.log(`HERO_MEDIA_URL=${heroMedia.url}`)
console.log(`HOME_PAGE_ID=${homePage.id}`)

await payload.destroy()
