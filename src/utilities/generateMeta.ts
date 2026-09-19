import type { Metadata } from 'next'
import type { Page, Post } from '@/payload-types'
import { mediaURL, site, siteURL } from './site'

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
  const rawTitle = doc.meta?.title || doc.title || site.name
  const cleanTitle = rawTitle.replace(/\s*\|\s*(Payload Website Template|ShoppeCove)$/i, '')
  const title = `${cleanTitle} | ${site.name}`
  const description = doc.meta?.description || site.description
  const image = doc.meta?.image || ('heroImage' in doc ? doc.heroImage : null)
  const imageURL =
    image && typeof image === 'object'
      ? mediaURL(image.sizes?.og?.url || image.url)
      : siteURL('/images/kitchen-editorial.webp')
  const post = collection === 'posts' ? (doc as Partial<Post>) : undefined
  return {
    title,
    description,
    alternates: { canonical: siteURL(path) },
    openGraph: {
      title,
      description,
      url: siteURL(path),
      siteName: site.name,
      locale: 'en_US',
      type: post ? 'article' : 'website',
      images: imageURL ? [{ url: imageURL }] : [],
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
