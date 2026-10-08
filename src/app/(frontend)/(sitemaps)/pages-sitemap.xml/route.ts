import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { site } from '@/utilities/site'
import { publication } from '@/utilities/publication'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = site.url

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      { loc: `${SITE_URL}/affiliate-disclosure` },
      { loc: `${SITE_URL}/privacy-policy`, lastmod: publication.policyUpdatedAt },
      { loc: `${SITE_URL}/terms-and-conditions`, lastmod: publication.policyUpdatedAt },
      { loc: `${SITE_URL}/earnings-disclaimer`, lastmod: publication.policyUpdatedAt },
      {
        loc: `${SITE_URL}/editorial-policy`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
    ]
    const staticLocations = new Set(defaultSitemap.map(({ loc }) => loc))

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug) && page.slug !== 'terms')
          .map((page) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
          .filter(({ loc }) => !staticLocations.has(loc))
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap', site.url, 'policies-2026-10-08'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
