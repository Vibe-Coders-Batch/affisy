const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shoppecove.com').replace(/\/$/, '')

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/search',
    '/next/*',
    '/posts/page/*',
    '/posts-sitemap.xml',
    '/pages-sitemap.xml',
  ],
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/next/'] }],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
