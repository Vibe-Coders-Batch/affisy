import 'dotenv/config'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types'
import { nodeText } from '@/utilities/article'
import { generateMeta } from '@/utilities/generateMeta'

const apply = process.argv.includes('--apply')
const oldSlug = 'matsato-osuren-review'
const slug = 'matsato-osuren-knife-review'
const seoTitle = 'Matsato Osuren Knife Review (2026): Features, Price & Pros and Cons'
const description =
  'Matsato Osuren knife review: see its 16 cm specifications, features, package prices, pros and cons, and seller’s 60-day return policy before ordering.'
const openGraphTitle = 'Matsato Osuren Knife Review: Features, Price and Return Policy'
const openGraphDescription =
  'Explore the Matsato Osuren knife’s listed specifications, design features, package prices, and seller-published return policy before purchasing.'
const imageAlt =
  'Matsato Osuren kitchen knife with a stainless-steel blade and Pakka and acacia wood handle'
const secondaryKeywords = [
  'Matsato Osuren knife',
  'Matsato Osuren review',
  'Matsato Osuren knife price',
  'Matsato Osuren knife specifications',
  'Matsato Osuren return policy',
  'Matsato Osuren 16 cm knife',
  'Matsato Osuren pros and cons',
  'Matsato Osuren stainless steel knife',
]

const markdown = await readFile('docs/articles/matsato-osuren-review.md', 'utf8')
const blocks = markdown.trim().split(/\n\n+/)
const title = blocks.shift()?.replace(/^# /, '')
if (title !== 'Matsato Osuren Knife Review (2026): Features, Price, Pros and Cons') {
  throw new Error('Unexpected article title; review the source before updating Payload.')
}

const base = { version: 1, direction: 'ltr' as const, format: '' as const, indent: 0 }
const text = (value: string) => ({
  type: 'text',
  version: 1,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value.replace(/\*\*/g, ''),
})
const element = (type: string, value: string, tag?: string) => ({
  ...base,
  type,
  ...(tag ? { tag } : {}),
  children: [text(value)],
})
const children: Post['content']['root']['children'] = []
for (const block of blocks) {
  if (block.startsWith('## ')) children.push(element('heading', block.slice(3), 'h2'))
  else if (block.startsWith('### ')) children.push(element('heading', block.slice(4), 'h3'))
  else if (block.startsWith('- ')) {
    const item = { ...base, type: 'listitem', value: 1, children: [text(block.slice(2))] }
    const previous = children.at(-1)
    if (previous?.type === 'list') {
      item.value = (previous.children as unknown[]).length + 1
      ;(previous.children as unknown[]).push(item)
    } else {
      children.push({ ...base, type: 'list', listType: 'bullet', tag: 'ul', start: 1, children: [item] })
    }
  } else children.push(element('paragraph', block))
}

const payload = await getPayload({ config })
try {
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { in: [oldSlug, slug] } },
    draft: true,
    depth: 0,
    limit: 2,
  })
  const post = result.docs.find((item) => item.slug === oldSlug || item.slug === slug)
  if (!post || result.docs.length !== 1 || post._status !== 'published') {
    throw new Error('Expected exactly one published Matsato post; no changes were made.')
  }
  const imageID =
    typeof post.heroImage === 'string' ? post.heroImage : post.heroImage?.id
  if (!imageID) throw new Error('Featured image is missing; no changes were made.')
  const image = await payload.findByID({ collection: 'media', id: imageID, depth: 0 })
  if (image.filename !== 'matsato-osuren-kitchen.webp') {
    throw new Error('Unexpected featured image; review its alt text before updating.')
  }
  const mediaBlocks = post.content.root.children.filter((node) => node.type === 'block')
  if (mediaBlocks.length !== 2) throw new Error('Expected two existing product image blocks.')
  const insertMediaBefore = (heading: string, mediaBlock: (typeof mediaBlocks)[number]) => {
    const index = children.findIndex(
      (node) => node.type === 'heading' && nodeText(node) === heading,
    )
    if (index < 0) throw new Error(`Missing image placement heading: ${heading}`)
    children.splice(index, 0, mediaBlock)
  }
  insertMediaBefore('Matsato Osuren Features', mediaBlocks[0])
  insertMediaBefore('Matsato Osuren Knife Specifications', mediaBlocks[1])

  const data: Partial<Post> = {
    title,
    slug,
    _status: 'published',
    content: { root: { ...base, type: 'root', children } },
    meta: {
      ...post.meta,
      title: seoTitle,
      useExactTitle: true,
      description,
      focusKeyphrase: 'Matsato Osuren knife review',
      secondaryKeywords: secondaryKeywords.map((keyword) => ({ keyword })),
      openGraphTitle,
      openGraphDescription,
    },
    review: {
      ...post.review,
      basis:
        'This review uses seller-provided specifications, promotional information, package prices and return-policy terms. We have not independently tested the knife or verified its performance claims.',
      summary:
        'A 16 cm stainless-steel kitchen knife with an index-finger opening and Pakka and acacia wood handle. Compare the listed dimensions, current package price and applicable return terms before ordering.',
      advantages: [
        { text: 'The seller provides dimensions and material specifications for the 16 cm configuration.' },
        { text: 'The distinctive finger opening and wood handle offer a design to compare with conventional knives.' },
        { text: 'Listed bundle options lower the per-knife price when purchasing multiple units.' },
      ],
      considerations: [
        { text: 'Performance claims have not been independently tested for this review.' },
        { text: 'The finger opening and handle shape may not suit every grip.' },
        { text: 'Prices, shipping costs and return eligibility should be checked at checkout.' },
      ],
      linkLabel: 'Check current Matsato Osuren price',
      ctaTitle: 'Compare the current package prices',
      ctaDescription:
        'Open the seller’s offer to confirm the selected quantity, delivered price and applicable return terms before ordering.',
      ctaAfterHeading: 'Matsato Osuren Price and Packages',
      sources: [
        ...(post.review?.sources || []),
        {
          title: 'Matsato Osuren — official 16 cm knife specifications',
          url: 'https://support.matsato-osuren.com/support/solutions/articles/155000007472-what-are-the-specifications-of-a-matsato-osuren-knife-',
        },
        {
          title: 'Matsato Osuren — official return help',
          url: 'https://support.matsato-osuren.com/support/solutions/articles/155000007477-how-can-i-return-my-package-',
        },
      ].filter((source, index, sources) => sources.findIndex((item) => item.url === source.url) === index),
    },
  }
  const preview = await generateMeta({
    doc: { ...post, ...data, heroImage: image, meta: { ...data.meta, image } },
    collection: 'posts',
  })
  console.log(
    JSON.stringify({
      mode: apply ? 'apply' : 'preview',
      id: post.id,
      oldSlug: post.slug,
      slug,
      bodyWords: nodeText(data.content!.root).trim().split(/\s+/).length,
      headings: children.filter((node) => node.type === 'heading').length,
      images: mediaBlocks.length,
      title: preview.title,
      description: preview.description,
      keywords: preview.keywords,
      openGraph: preview.openGraph,
    }),
  )
  if (!apply) process.exit(0)

  await mkdir('.local-backups', { recursive: true })
  await writeFile(
    `.local-backups/matsato-before-seo-and-article-${Date.now()}.json`,
    JSON.stringify({ post, image }, null, 2),
  )
  await payload.update({
    collection: 'media',
    id: image.id,
    data: { alt: imageAlt },
    context: { disableRevalidate: true },
  })
  await payload.update({
    collection: 'posts',
    id: post.id,
    data,
    draft: false,
    context: { disableRevalidate: true },
  })

  const oldPath = `/posts/${oldSlug}`
  const redirect = await payload.find({
    collection: 'redirects',
    where: { from: { equals: oldPath } },
    depth: 0,
    limit: 1,
  })
  const to = { type: 'custom' as const, url: `/posts/${slug}` }
  if (redirect.docs[0]) {
    await payload.update({
      collection: 'redirects',
      id: redirect.docs[0].id,
      data: { to },
      context: { disableRevalidate: true },
    })
  } else {
    await payload.create({
      collection: 'redirects',
      data: { from: oldPath, to },
      context: { disableRevalidate: true },
    })
  }

  const saved = await payload.findByID({ collection: 'posts', id: post.id, draft: false, depth: 1 })
  const savedImage = saved.heroImage
  const savedMeta = await generateMeta({ doc: saved, collection: 'posts' })
  const savedRedirect = await payload.find({
    collection: 'redirects',
    where: { from: { equals: oldPath } },
    depth: 0,
    limit: 1,
  })
  if (
    saved.slug !== slug ||
    saved._status !== 'published' ||
    nodeText(saved.content.root) !== nodeText(data.content!.root) ||
    savedMeta.title !== seoTitle ||
    savedMeta.description !== description ||
    savedMeta.keywords?.length !== secondaryKeywords.length + 1 ||
    savedMeta.openGraph?.title !== openGraphTitle ||
    savedMeta.openGraph?.description !== openGraphDescription ||
    savedRedirect.docs[0]?.to?.url !== `/posts/${slug}` ||
    (typeof savedImage === 'object' && savedImage?.alt !== imageAlt)
  ) {
    throw new Error('Saved article or metadata verification failed.')
  }
  console.log(JSON.stringify({ saved: true, id: saved.id, slug: saved.slug, status: saved._status }))
} finally {
  await payload.destroy()
}
process.exit(0)
