import type { Metadata } from 'next'
import { site, siteURL } from './site'

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => ({
  type: 'website',
  description: site.description,
  siteName: site.name,
  title: site.name,
  images: [{ url: siteURL('/images/kitchen-editorial.webp') }],
  ...og,
})
