import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@payload-config'

const affiliateURL = 'https://5c1abeu6xrjqzx6bje76681mqp.hop.clickbank.net/?&traffic_source=blog'
const payload = await getPayload({ config })
const context = { disableRevalidate: true }
try {
  const matsato = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: 'matsato-osuren-review' } },
      draft: true,
      depth: 0,
      limit: 1,
    })
  ).docs[0]
  const derila = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: 'derila-ergo-pillow-review' } },
      draft: true,
      depth: 0,
      limit: 1,
    })
  ).docs[0]
  if (!matsato || !derila) throw new Error('Expected offer articles are missing.')
  await mkdir('.local-backups', { recursive: true })
  await writeFile(
    `.local-backups/offers-before-matsato-publication-${Date.now()}.json`,
    JSON.stringify({ matsato, derila }, null, 2),
  )

  // Publish the latest draft content, including edits made since it was first created.
  await payload.update({
    collection: 'posts',
    id: matsato.id,
    draft: false,
    context,
    data: {
      title: matsato.title,
      slug: matsato.slug,
      content: matsato.content,
      categories: matsato.categories,
      heroImage: matsato.heroImage,
      imageCaption: matsato.imageCaption,
      authors: matsato.authors,
      meta: matsato.meta,
      relatedPosts: matsato.relatedPosts,
      review: { ...matsato.review, affiliateURL, linkLabel: 'Check price & availability' },
      _status: 'published',
    },
  })

  const publicDerila = await payload.find({
    collection: 'posts',
    where: { slug: { equals: derila.slug } },
    draft: false,
    overrideAccess: false,
    limit: 1,
    depth: 0,
  })
  if (derila._status !== 'draft' || publicDerila.docs.length) {
    await payload.update({
      collection: 'posts',
      id: derila.id,
      draft: false,
      data: { _status: 'draft' },
      context,
    })
  }
  const publicMatsato = (
    await payload.find({
      collection: 'posts',
      where: { slug: { equals: matsato.slug } },
      draft: false,
      overrideAccess: false,
      limit: 1,
      depth: 0,
    })
  ).docs[0]
  const savedDerila = await payload.findByID({
    collection: 'posts',
    id: derila.id,
    draft: true,
    depth: 0,
  })
  const visibleDerila = await payload.find({
    collection: 'posts',
    where: { slug: { equals: derila.slug } },
    draft: false,
    overrideAccess: false,
    limit: 1,
    depth: 0,
  })
  if (publicMatsato?.review?.affiliateURL !== affiliateURL || publicMatsato._status !== 'published')
    throw new Error('Matsato publication verification failed.')
  if (savedDerila._status !== 'draft' || visibleDerila.docs.length)
    throw new Error('Derila draft visibility verification failed.')
  console.log(
    JSON.stringify({
      matsato: {
        id: publicMatsato.id,
        status: publicMatsato._status,
        affiliateURL: publicMatsato.review.affiliateURL,
        publishedAt: publicMatsato.publishedAt,
      },
      derila: { status: savedDerila._status, publiclyVisible: false },
    }),
  )
} finally {
  await payload.destroy()
}
process.exit(0)
