import type { Metadata } from 'next'
import type { Page, Post } from '@/payload-types'
import { mediaURL, site, siteURL } from './site'
import { journalHome } from '@/content/journal-home'

export const generateMeta = async ({
  doc,
  collection = 'pages',
}: {
  doc: Partial<Page> | Partial<Post> | null
  collection?: 'pages' | 'posts'
}): Promise<Metadata> => {
  if (!doc) return { title: 'Page not found | ShoppeCove', robots: { index: false, follow: false } }
  const path =
    doc.slug === 'home' ? '/' : `/${collection === 'posts' ? 'posts/' : ''}${doc.slug || ''}`
  const post = collection === 'posts' ? (doc as Partial<Post>) : undefined
  const starterHome =
    doc.slug === 'home' &&
    doc.meta?.title === 'Buying guides for a more thoughtful everyday | ShoppeCove'
  const rawTitle = starterHome ? journalHome.metaTitle : doc.meta?.title || doc.title || site.name
  const cleanTitle = rawTitle.replace(/\s*\|\s*(Payload Website Template|ShoppeCove)$/i, '')
  const title = post?.meta?.useExactTitle ? cleanTitle : `${cleanTitle} | ${site.name}`
  const description = starterHome
    ? journalHome.metaDescription
    : doc.meta?.description || site.description
  const keywords = [
    post?.meta?.focusKeyphrase,
    ...(post?.meta?.secondaryKeywords?.map((item) => item.keyword) || []),
  ].filter((keyword): keyword is string => Boolean(keyword))
  const image = doc.meta?.image || ('heroImage' in doc ? doc.heroImage : null)
  const imageURL =
    image && typeof image === 'object'
      ? mediaURL(image.sizes?.og?.url || image.url)
      : siteURL('/images/journal-social.png')
  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical: siteURL(path) },
    openGraph: {
      title: post?.meta?.openGraphTitle || title,
      description: post?.meta?.openGraphDescription || description,
      url: siteURL(path),
      siteName: site.name,
      locale: 'en_US',
      type: post ? 'article' : 'website',
      images:
        imageURL && image && typeof image === 'object'
          ? [{ url: imageURL, alt: image.alt || undefined }]
          : imageURL
            ? [{ url: imageURL }]
            : [],
      ...(post
        ? {
            publishedTime: post.publishedAt || undefined,
            modifiedTime: post.updatedAt,
            authors: post.populatedAuthors?.flatMap((a) => (a.name ? [a.name] : [])),
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageURL ? [imageURL] : [],
    },
    ...(doc._status === 'draft' ? { robots: { index: false, follow: false } } : {}),
  }
}
