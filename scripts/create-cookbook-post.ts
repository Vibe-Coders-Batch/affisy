import 'dotenv/config'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Media } from '@/payload-types'
import {
  cookbookAffiliateURL,
  cookbookIntro,
  cookbookPost,
  cookbookSections,
  cookbookSlug,
} from '@/content/plant-based-cookbook'
import { articleDetails, nodeText } from '@/utilities/article'

const apply = process.argv.includes('--apply')
const publish = process.argv.includes('--publish')
if (publish && !apply) throw new Error('--publish requires --apply')
const context = () => ({ disableRevalidate: true })
const filename = 'plant-based-cookbook-bundle.webp'
const caption =
  'Seller-supplied artwork showing the digital cookbook and bundle guides. No physical books or devices are included. Image use is permitted by the affiliate resource page.'
const payload = await getPayload({ config })

try {
  const [existing, kitchen, matsato, derila, mediaResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: { slug: { equals: cookbookSlug } },
      draft: true,
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'categories',
      where: { slug: { equals: 'kitchen' } },
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'posts',
      where: { slug: { equals: 'matsato-osuren-review' } },
      draft: true,
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'posts',
      where: { slug: { equals: 'derila-ergo-pillow-review' } },
      draft: true,
      depth: 0,
      limit: 1,
    }),
    payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      depth: 0,
      limit: 1,
    }),
  ])
  if (!kitchen.docs[0]) throw new Error('The existing kitchen category is missing.')
  const post = existing.docs[0]
  const protectedDerila = derila.docs[0]
  const protectedMatsato = matsato.docs[0]
  if (protectedDerila && protectedDerila._status !== 'draft')
    throw new Error('Derila is expected to remain draft-only; inspect before continuing.')
  if (post?._status === 'published')
    throw new Error(
      'Existing published cookbook post preserved; this script only creates or finishes a draft.',
    )
  console.log(
    JSON.stringify({
      mode: apply ? (publish ? 'publish' : 'save draft') : 'preview',
      slug: cookbookSlug,
      existingStatus: post?._status || 'missing',
      category: kitchen.docs[0].title,
      affiliateLinkProvided: true,
      protectedDerilaStatus: protectedDerila?._status,
    }),
  )
  if (apply) {
    if (post) {
      await mkdir('.local-backups', { recursive: true })
      await writeFile(
        `.local-backups/cookbook-before-update-${Date.now()}.json`,
        JSON.stringify(post, null, 2),
      )
    }
    let media = mediaResult.docs[0]
    if (!media) {
      const captionData: NonNullable<Media['caption']> = {
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
                {
                  type: 'text',
                  version: 1,
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: caption,
                },
              ],
            },
          ],
        },
      }
      media = await payload.create({
        collection: 'media',
        filePath: path.resolve('public/images', filename),
        data: {
          alt: 'Seller artwork of the Complete Plant-Based Cookbook and four companion digital guides displayed on device mockups',
          caption: captionData,
        },
        context: context(),
      })
    }
    if (!media.url || !(await fetch(media.url, { method: 'HEAD' })).ok)
      throw new Error('Uploaded cookbook artwork is not reachable.')
    const content = cookbookPost(media.id)
    const data = {
      ...content,
      categories: [kitchen.docs[0].id],
      relatedPosts: protectedMatsato?._status === 'published' ? [protectedMatsato.id] : [],
      // Keep product artwork at its natural ratio inside the article instead of cropping its labels in the wide hero.
      heroImage: null,
      _status: publish ? ('published' as const) : ('draft' as const),
    }
    const saved = post
      ? await payload.update({
          collection: 'posts',
          id: post.id,
          data,
          draft: !publish,
          context: context(),
        })
      : await payload.create({ collection: 'posts', data, draft: !publish, context: context() })
    const verified = await payload.findByID({
      collection: 'posts',
      id: saved.id,
      draft: !publish,
      depth: 1,
    })
    const visible = await payload.find({
      collection: 'posts',
      where: { slug: { equals: cookbookSlug } },
      draft: false,
      overrideAccess: false,
      depth: 0,
      limit: 1,
    })
    if (verified.review?.affiliateURL !== cookbookAffiliateURL || verified._status !== data._status)
      throw new Error('Saved status/link mismatch.')
    if (nodeText(verified.content.root) !== nodeText(content.content.root))
      throw new Error('Saved article text differs.')
    if (publish !== (visible.docs.length === 1))
      throw new Error('Public visibility did not match expected state.')
    for (const protectedPost of [protectedDerila, protectedMatsato]) {
      if (!protectedPost) continue
      const after = await payload.findByID({
        collection: 'posts',
        id: protectedPost.id,
        depth: 0,
        draft: true,
      })
      if (after.updatedAt !== protectedPost.updatedAt || after._status !== protectedPost._status)
        throw new Error(`Unrelated post changed: ${protectedPost.slug}`)
    }
    const draftText =
      `# ${verified.title}\n\n${verified.review?.basis}\n\n${cookbookIntro.join('\n\n')}\n\n` +
      cookbookSections
        .map(
          (s) =>
            `## ${s.title}\n\n${(s.paragraphs || []).join('\n\n')}${s.bullets?.length ? '\n\n' + s.bullets.map((b) => '- ' + b).join('\n') : ''}`,
        )
        .join('\n\n') +
      `\n\n[See current cookbook options](${cookbookAffiliateURL})\n\nAffiliate link: ShoppeCove may earn a commission if you buy.\n`
    await mkdir('docs/articles', { recursive: true })
    await writeFile('docs/articles/complete-plant-based-cookbook-review.md', draftText)
    console.log(
      JSON.stringify({
        id: verified.id,
        title: verified.title,
        status: verified._status,
        slug: verified.slug,
        bodyWords: nodeText(verified.content.root).split(/\s+/).length,
        readingMinutes: articleDetails(verified.content).readingMinutes,
        headingCount: articleDetails(verified.content).headings.length,
        sourceCount: verified.review?.sources?.length,
        artwork: media.filename,
        relatedPostCount: verified.relatedPosts?.length,
        publicVisible: visible.docs.length === 1,
        adminURL: `http://localhost:3000/admin/collections/posts/${verified.id}`,
        previewURL: `http://localhost:3000/posts/${verified.slug}`,
        derilaAndMatsatoPreserved: true,
      }),
    )
  }
} finally {
  await payload.destroy()
}
process.exit(0)
