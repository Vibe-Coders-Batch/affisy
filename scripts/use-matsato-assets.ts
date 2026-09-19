import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media, Post } from '@/payload-types'
import { nodeText } from '@/utilities/article'

const apply = process.argv.includes('--apply')
// Storage hooks mutate request context internally; each operation needs its own object.
const mutationContext = () => ({ disableRevalidate: true })
const affiliateURL = 'https://5c1abeu6xrjqzx6bje76681mqp.hop.clickbank.net/?&traffic_source=blog'
const assets = [
  {
    filename: 'matsato-osuren-kitchen.webp',
    alt: 'Matsato Osuren knife slicing a block of cheese on a wooden cutting board',
    caption:
      'Matsato Osuren in use in a supplier-provided photograph. This is not a ShoppeCove hands-on test.',
  },
  {
    filename: 'matsato-osuren-product.webp',
    alt: 'Side view of the Matsato Osuren knife showing the curved blade, round finger opening, and two-tone handle',
    caption:
      'Supplier-provided product image showing the blade profile and finger opening. Appearance does not establish cutting performance.',
  },
  {
    filename: 'matsato-osuren-grip.webp',
    alt: 'Close-up of a hand holding the Matsato Osuren knife beside its finger opening',
    caption:
      'Supplier-provided grip photograph. Check the handle and opening dimensions; a photograph cannot establish comfort or fit.',
  },
]
function caption(text: string): NonNullable<Media['caption']> {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [
            { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text },
          ],
        },
      ],
    },
  }
}
const payload = await getPayload({ config })
try {
  const [posts, pages, derilaPosts] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { slug: { equals: 'matsato-osuren-review' } },
      depth: 0,
      draft: true,
      limit: 1,
    }),
    payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      depth: 0,
      draft: true,
      limit: 1,
    }),
    payload.find({
      collection: 'posts',
      where: { slug: { equals: 'derila-ergo-pillow-review' } },
      depth: 0,
      draft: true,
      limit: 1,
    }),
  ])
  const post = posts.docs[0]
  const home = pages.docs[0]
  const derila = derilaPosts.docs[0]
  if (!post || !home || !derila) throw new Error('Expected content is missing.')
  if (post._status !== 'published' || home._status !== 'published')
    throw new Error('Preserve pending drafts; review before applying.')
  if (post.review?.affiliateURL !== affiliateURL)
    throw new Error('Unexpected affiliate URL; preserve it for review.')
  if (derila._status !== 'draft') throw new Error('Derila must remain a draft.')
  if (!home.layout.some((block) => block.blockType === 'affiliateHome'))
    throw new Error('Expected homepage layout is missing.')
  if (!apply) {
    console.log(
      JSON.stringify({
        mode: 'preview',
        article: post.slug,
        homepage: home.slug,
        assets,
        derilaStatus: derila._status,
      }),
    )
  } else {
    await mkdir('.local-backups', { recursive: true })
    await writeFile(
      `.local-backups/before-matsato-assets-${Date.now()}.json`,
      JSON.stringify({ post, home, derila }, null, 2),
    )
    const media: Media[] = []
    for (const asset of assets) {
      const existing = (
        await payload.find({
          collection: 'media',
          where: { or: [{ filename: { equals: asset.filename } }, { alt: { equals: asset.alt } }] },
          depth: 0,
          limit: 1,
        })
      ).docs[0]
      const data = { alt: asset.alt, caption: caption(asset.caption) }
      const restoreFile = existing?.url && !(await fetch(existing.url, { method: 'HEAD' })).ok
      media.push(
        existing
          ? await payload.update({
              collection: 'media',
              id: existing.id,
              data,
              context: mutationContext(),
              ...(restoreFile ? { filePath: path.resolve('public/images', asset.filename) } : {}),
            })
          : await payload.create({
              collection: 'media',
              data,
              filePath: path.resolve('public/images', asset.filename),
              context: mutationContext(),
            }),
      )
    }
    for (const item of media) {
      if (!item.url || !(await fetch(item.url, { method: 'HEAD' })).ok)
        throw new Error(`Image is not publicly available: ${item.filename}`)
    }
    const children = [...post.content.root.children]
    const insertBefore = (heading: string, name: string, mediaID: string) => {
      if (
        children.some(
          (node) =>
            node.type === 'block' && (node.fields as { blockName?: string })?.blockName === name,
        )
      )
        return
      const index = children.findIndex(
        (node) => node.type === 'heading' && nodeText(node) === heading,
      )
      if (index < 0) throw new Error(`Missing expected heading: ${heading}`)
      children.splice(index, 0, {
        type: 'block',
        version: 2,
        format: '',
        fields: { blockType: 'mediaBlock', blockName: name, media: mediaID },
      })
    }
    insertBefore(
      'Start with the grip, not the discount',
      'Matsato supplier product view',
      media[1].id,
    )
    insertBefore(
      'Which details are still worth verifying?',
      'Matsato supplier grip detail',
      media[2].id,
    )
    await payload.update({
      collection: 'posts',
      id: post.id,
      draft: false,
      context: mutationContext(),
      data: {
        heroImage: media[0].id,
        imageCaption: assets[0].caption,
        meta: { ...post.meta, image: media[0].id },
        content: { ...post.content, root: { ...post.content.root, children } } as Post['content'],
      },
    })
    await payload.update({
      collection: 'pages',
      id: home.id,
      draft: false,
      context: mutationContext(),
      data: {
        layout: home.layout.map((block) =>
          block.blockType === 'affiliateHome' ? { ...block, heroImage: media[0].id } : block,
        ),
        meta: { ...home.meta, image: media[0].id },
      },
    })
    const saved = await payload.findByID({
      collection: 'posts',
      id: post.id,
      depth: 1,
      draft: false,
      overrideAccess: false,
    })
    const savedHome = await payload.findByID({
      collection: 'pages',
      id: home.id,
      depth: 0,
      draft: false,
      overrideAccess: false,
    })
    const hidden = await payload.find({
      collection: 'posts',
      where: { slug: { equals: derila.slug } },
      depth: 0,
      draft: false,
      overrideAccess: false,
    })
    const savedDerila = await payload.findByID({
      collection: 'posts',
      id: derila.id,
      depth: 0,
      draft: true,
    })
    if (saved._status !== 'published' || saved.review?.affiliateURL !== affiliateURL)
      throw new Error('Article status or affiliate URL changed.')
    if (typeof saved.heroImage !== 'object' || saved.heroImage?.id !== media[0].id)
      throw new Error('Hero image verification failed.')
    if (
      savedHome.meta?.image !== media[0].id ||
      !savedHome.layout.some(
        (block) => block.blockType === 'affiliateHome' && block.heroImage === media[0].id,
      )
    )
      throw new Error('Homepage image verification failed.')
    if (
      hidden.docs.length ||
      savedDerila._status !== 'draft' ||
      savedDerila.updatedAt !== derila.updatedAt
    )
      throw new Error('Derila draft changed.')
    console.log(
      JSON.stringify({
        article: saved.slug,
        status: saved._status,
        hero: saved.heroImage.filename,
        inlineImages: 2,
        affiliateLinkPreserved: true,
        homepageUpdated: true,
        derila: 'Unchanged draft, not publicly visible',
        media: media.map(({ id, filename, filesize }) => ({ id, filename, filesize })),
      }),
    )
  }
} finally {
  await payload.destroy()
}
process.exit(0)
