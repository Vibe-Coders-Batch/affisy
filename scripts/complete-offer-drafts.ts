import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '@/payload-types'
import { shoppecoveGuides } from '@/content/shoppecove-guides'
import { nodeText } from '@/utilities/article'

const apply = process.argv.includes('--apply')
const context = { disableRevalidate: true }
const payload = await getPayload({ config })

const additions: Record<string, { title: string; body: string }[]> = {
  'matsato-osuren-review': [
    {
      title: 'Common questions about the Osuren',
      body: 'Is this a hands-on review? No. This article examines seller information and buying considerations. We have not tested cutting performance, comfort, or edge retention.',
    },
    {
      title: 'Does Japanese-style mean made in Japan?',
      body: 'The phrase alone does not establish a country of manufacture. Ask the seller for the manufacturing origin if that is important to your decision.',
    },
    {
      title: 'Should you buy one knife or a bundle?',
      body: 'Compare the total cost for the quantity you will use. A lower per-knife bundle price does not make the larger purchase better value if you only need one. Check the selected quantity again at checkout.',
    },
    {
      title: 'Does the ice-hardening claim prove durability?',
      body: 'The seller describes a hardening process, but that description is not a comparative wear test. Without independent measurements, we cannot rank its durability against other knives.',
    },
  ],
  'derila-ergo-pillow-review': [
    {
      title: 'Product details found on the seller page',
      body: 'At the time of checking, the product page’s visible size labels listed 54 × 36 cm (21.2 × 14.1 inches). An image description on the same page referred to another size, so confirm the dimensions of the exact version in your basket rather than treating the page as a consistent specification. Pillow height was not stated in those visible labels.\n\nThe seller describes a removable nylon–elastane cover washable at 30°C (86°F), with spot cleaning for the memory foam core. These are seller-provided instructions; follow the care label supplied with your particular pillow. The storefront localized to India during our check, so this article does not quote a US price or promise US-specific return conditions.',
    },
    {
      title: 'Common questions about Derila Ergo',
      body: 'Have we tested the pillow? No. This is a research-based buying guide, using the seller’s page and supplied promotional materials. It does not report personal sleep results.',
    },
    {
      title: 'Can the whole pillow go in a washing machine?',
      body: 'The seller distinguishes the removable cover from the foam core. Its page describes machine washing the cover at 30°C and spot cleaning the core. Check the supplied care label before cleaning.',
    },
    {
      title: 'Will it suit every sleeping position?',
      body: 'The seller markets the pillow for several positions, but this does not establish that its shape and height suit every person. Compare its dimensions and adjustability with the pillow you already use, and check whether the return policy allows a comfort evaluation.',
    },
    {
      title: 'Can we recommend it for snoring or sleep apnea?',
      body: 'We have not verified treatment claims and do not recommend it on that basis. Advertising and customer testimonials are not the evidence used for a medical recommendation.',
    },
  ],
}

function section(title: string, body: string, tag: 'h2' | 'h3') {
  const text = (value: string) => ({
    type: 'text',
    version: 1,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: value,
  })
  return [
    {
      type: 'heading',
      tag,
      children: [text(title)],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
    ...body
      .split('\n\n')
      .map((value) => ({
        type: 'paragraph',
        children: [text(value)],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
        textFormat: 0,
      })),
  ]
}

try {
  const checklist = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: 'online-shopping-checklist' } },
      limit: 1,
      depth: 0,
      draft: true,
    })
  ).docs[0]
  for (const guide of shoppecoveGuides.slice(0, 2)) {
    const result = await payload.find({
      collection: 'posts',
      where: { slug: { equals: guide.slug } },
      limit: 1,
      depth: 1,
      draft: true,
    })
    const post = result.docs[0]
    if (!post) throw new Error(`Missing draft: ${guide.slug}. Run setup-shoppecove first.`)
    console.log(
      JSON.stringify({
        id: post.id,
        title: post.title,
        status: post._status,
        image: !!post.heroImage,
        seoImage: !!post.meta?.image,
        categories: post.categories?.map((c) => (typeof c === 'object' ? c.title : c)),
        hasAffiliateLink: !!post.review?.affiliateURL,
        adminURL: `http://localhost:3000/admin/collections/posts/${post.id}`,
      }),
    )
    if (!apply) continue
    if (post._status !== 'draft') {
      console.log('Preserved published article.')
      continue
    }

    await mkdir('.local-backups', { recursive: true })
    await writeFile(`.local-backups/${post.slug}-${Date.now()}.json`, JSON.stringify(post, null, 2))
    const kitchen = guide.topic === 'kitchen'
    const filename = kitchen ? 'kitchen-editorial.webp' : 'sleep-editorial.webp'
    const caption = kitchen
      ? 'AI-generated kitchen illustration. The knife shown is generic, not a Matsato Osuren product photograph.'
      : 'AI-generated bedroom illustration. The pillow shown is generic, not a Derila Ergo product photograph.'
    const alt = kitchen
      ? 'Illustrative kitchen scene with a generic chef’s knife, tomatoes, and an oak cutting board'
      : 'Illustrative bedroom scene with a generic white pillow, ivory bedding, and a sage green throw'
    let mediaID = typeof post.heroImage === 'object' ? post.heroImage?.id : post.heroImage
    if (!mediaID) {
      const media =
        (
          await payload.find({
            collection: 'media',
            where: { filename: { equals: filename } },
            limit: 1,
            depth: 0,
          })
        ).docs[0] ||
        (await payload.create({
          collection: 'media',
          data: { alt },
          filePath: path.resolve('public/images', filename),
          context,
        }))
      mediaID = media.id
    }
    const sameOriginalContent = nodeText(post.content.root) === nodeText(guide.content.root)
    const data: Partial<Post> = {
      heroImage: mediaID,
      meta: { ...post.meta, image: post.meta?.image || mediaID },
      ...(!post.heroImage ? { imageCaption: caption } : {}),
      relatedPosts: post.relatedPosts?.length
        ? post.relatedPosts.map((p) => (typeof p === 'object' ? p.id : p))
        : checklist
          ? [checklist.id]
          : [],
    }
    if (sameOriginalContent) {
      const extra = additions[guide.slug!].flatMap((s, index) =>
        section(
          s.title,
          s.body,
          index === 0 || s.title.startsWith('Common questions') ? 'h2' : 'h3',
        ),
      )
      data.content = {
        ...post.content,
        root: { ...post.content.root, children: [...post.content.root.children, ...extra] },
      } as Post['content']
      data.review = {
        ...post.review,
        sources: [
          ...(post.review?.sources || []),
          ...(kitchen
            ? [
                {
                  title: 'Matsato Osuren — current seller product page',
                  url: 'https://matsato-osuren.com/matsato-osuren/product?ang=clickbank',
                },
              ]
            : []),
        ],
      }
    } else console.log('Preserved existing article text (already enriched or edited).')
    const saved = await payload.update({
      collection: 'posts',
      id: post.id,
      draft: true,
      data,
      context,
    })
    const verified = await payload.findByID({
      collection: 'posts',
      id: saved.id,
      draft: true,
      depth: 1,
    })
    if (!verified.heroImage || !verified.meta?.image || verified._status !== 'draft')
      throw new Error(`Verification failed: ${post.slug}`)
    console.log(
      JSON.stringify({
        saved: verified.slug,
        status: verified._status,
        hasHero: !!verified.heroImage,
        hasSEOImage: !!verified.meta?.image,
        bodyNodes: verified.content.root.children.length,
        sources: verified.review?.sources?.length,
        relatedPosts: verified.relatedPosts?.length,
      }),
    )
  }
} finally {
  await payload.destroy()
}
process.exit(0)
