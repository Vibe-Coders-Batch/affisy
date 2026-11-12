const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blogs.shoppercove.com').replace(
  /\/$/,
  '',
)

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  // The live sitemaps own all URL entries and their modification dates.
  exclude: ['*'],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/next/'] }],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
