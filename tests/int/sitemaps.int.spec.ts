import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import { GET as getPagesSitemap } from '@/app/(frontend)/(sitemaps)/pages-sitemap.xml/route'
import { GET as getPostsSitemap } from '@/app/(frontend)/(sitemaps)/posts-sitemap.xml/route'
import { site } from '@/utilities/site'

const { find, cache } = vi.hoisted(() => ({
  find: vi.fn(),
  cache: vi.fn((fn) => fn),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('next/cache', () => ({ unstable_cache: cache }))

describe('Sitemaps', () => {
  it('publishes an index of the two live sitemaps even when the build prerenders articles', () => {
    const require = createRequire(import.meta.url)
    const cli = resolve(dirname(require.resolve('next-sitemap')), '../../bin/next-sitemap.mjs')
    const config = resolve('next-sitemap.config.cjs')
    const cwd = mkdtempSync(join(tmpdir(), 'affisy-sitemap-'))
    const origin = 'https://journal.example'
    try {
      mkdirSync(join(cwd, '.next'))
      writeFileSync(join(cwd, '.next/build-manifest.json'), '{"pages":{}}')
      writeFileSync(join(cwd, '.next/export-marker.json'), '{}')
      writeFileSync(
        join(cwd, '.next/prerender-manifest.json'),
        JSON.stringify({ routes: { '/': {}, '/contact': {}, '/posts/old-review': {} } }),
      )
      execFileSync(process.execPath, [cli, '--config', config], {
        cwd,
        env: { ...process.env, NEXT_PUBLIC_SITE_URL: origin },
      })

      const publicDir = join(cwd, 'public')
      const index = readFileSync(join(publicDir, 'sitemap.xml'), 'utf8')
      expect(index).toContain('<sitemapindex')
      expect(Array.from(index.matchAll(/<loc>(.*?)<\/loc>/g), ([, url]) => url)).toEqual([
        `${origin}/pages-sitemap.xml`,
        `${origin}/posts-sitemap.xml`,
      ])
      expect(readdirSync(publicDir).sort()).toEqual(['robots.txt', 'sitemap.xml'])
      expect(readFileSync(join(publicDir, 'robots.txt'), 'utf8')).toContain(
        `Sitemap: ${origin}/sitemap.xml`,
      )
    } finally {
      rmSync(cwd, { recursive: true, force: true })
    }
  })

  it('refreshes the posts sitemap and uses publication data from the public query', async () => {
    const updatedAt = '2026-10-27T04:11:02.833Z'
    find.mockResolvedValueOnce({ docs: [{ slug: 'new-review', updatedAt }, { slug: null }] })
    const response = await getPostsSitemap()
    const xml = await response.text()
    expect(response.status).toBe(200)
    expect(xml).toContain(`<loc>${site.url}/posts/new-review</loc>`)
    expect(xml).toContain(`<lastmod>${updatedAt}</lastmod>`)
    expect(xml.match(/<loc>/g)).toHaveLength(1)
    expect(find).toHaveBeenLastCalledWith(
      expect.objectContaining({
        collection: 'posts',
        draft: false,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
      }),
    )
    expect(cache).toHaveBeenCalledWith(expect.any(Function), expect.any(Array), {
      tags: ['posts-sitemap'],
      revalidate: 300,
    })
  })

  it('keeps the home and public pages in the live sitemap without inventing journal dates', async () => {
    const updatedAt = '2026-10-08T12:00:00.000Z'
    find.mockResolvedValueOnce({
      docs: [
        { slug: 'home', updatedAt },
        { slug: 'contact', updatedAt },
        { slug: 'terms', updatedAt },
        { slug: 'editorial-policy', updatedAt },
      ],
    })
    const response = await getPagesSitemap()
    const xml = await response.text()
    const urls = new DOMParser().parseFromString(xml, 'application/xml').querySelectorAll('url')
    const dates = new Map(
      Array.from(urls, (url) => [
        url.querySelector('loc')?.textContent,
        url.querySelector('lastmod')?.textContent,
      ]),
    )
    expect(dates.get(`${site.url}/`)).toBe(updatedAt)
    expect(dates.get(`${site.url}/contact`)).toBe(updatedAt)
    expect(dates.has(`${site.url}/editorial-policy`)).toBe(true)
    expect(dates.has(`${site.url}/terms`)).toBe(false)
    expect(dates.has(`${site.url}/posts`)).toBe(true)
    expect(dates.get(`${site.url}/posts`)).toBeUndefined()
    expect(dates.size).toBe(urls.length)
    expect(cache).toHaveBeenCalledWith(expect.any(Function), expect.any(Array), {
      tags: ['pages-sitemap'],
      revalidate: 300,
    })
  })
})
