import { describe, expect, it } from 'vitest'
import { generateMeta } from '@/utilities/generateMeta'
import { articleDetails, jsonLD } from '@/utilities/article'
import { shoppecoveGuides } from '@/content/shoppecove-guides'
import type { Media, Post } from '@/payload-types'

const guide = shoppecoveGuides[0]
describe('ShoppeCove editorial SEO', () => {
  it('uses the public article URL and preserves absolute CDN image URLs', async () => {
    const meta = await generateMeta({
      collection: 'posts',
      doc: {
        ...guide,
        meta: {
          title: 'Knife guide | ShoppeCove',
          image: { url: 'https://cdn.example.com/knife.webp' } as Media,
        },
      },
    })
    expect(meta.title).toBe('Knife guide | ShoppeCove')
    expect(meta.alternates?.canonical).toBe('https://shoppecove.com/posts/matsato-osuren-review')
    expect(meta.openGraph?.url).toBe(meta.alternates?.canonical)
    expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn.example.com/knife.webp' }])
    expect(meta.robots).toEqual({ index: false, follow: false })
  })
  it('canonicalizes home to the root and marks missing documents noindex', async () => {
    expect(
      (await generateMeta({ doc: { slug: 'home', title: 'Home' } })).alternates?.canonical,
    ).toBe('https://shoppecove.com/')
    expect((await generateMeta({ doc: null })).robots).toEqual({ index: false, follow: false })
  })
  it('gives repeated headings stable, distinct anchors and estimates reading time', () => {
    const heading = guide.content.root.children[0]
    const content = {
      ...guide.content,
      root: { ...guide.content.root, children: [heading, heading] },
    } as Post['content']
    const { headings, readingMinutes } = articleDetails(content)
    expect(headings[1].id).toBe(`${headings[0].id}-2`)
    expect(readingMinutes).toBeGreaterThanOrEqual(1)
  })
  it('prevents CMS strings from breaking out of JSON-LD script tags', () => {
    const serialized = jsonLD({ headline: '</script><script>alert(1)</script>' })
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized).headline).toContain('</script>')
  })
  it('keeps unverified product content in drafts without fabricated tracking links', () => {
    for (const post of shoppecoveGuides) {
      expect(post._status).toBe('draft')
      expect(post.review?.affiliateURL).toBeUndefined()
      expect(post.review?.basis).toBeTruthy()
      expect(articleDetails(post.content as Post['content']).headings.length).toBeGreaterThan(3)
    }
  })
})
