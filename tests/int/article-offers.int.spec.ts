import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ArticleBody } from '@/components/Editorial/ArticleBody'
import { OfferCTA, ReviewSummary } from '@/components/Editorial/OfferCTA'
import { articleDetails, articleOfferSplit } from '@/utilities/article'
import { improveReview, supportingGuides, supportingPost } from '@/content/blog-improvements'
import { shoppecoveGuides } from '@/content/shoppecove-guides'
import type { Post } from '@/payload-types'

// The code editor's admin SCSS is unrelated to article/offer rendering.
vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))

const original = {
  ...shoppecoveGuides[0],
  review: {
    ...shoppecoveGuides[0].review,
    affiliateURL: 'https://example.com/offer?affiliate=keep-me',
  },
} as Post
const post = { ...original, ...improveReview(original) }

describe('Article purchase paths', () => {
  it('renders three disclosed seller links and preserves the affiliate URL', () => {
    const html = [
      createElement(ReviewSummary, { review: post.review }),
      createElement(ArticleBody, { content: post.content, review: post.review }),
      createElement(OfferCTA, { review: post.review, placement: 'verdict' }),
    ]
      .map((element) => renderToStaticMarkup(element))
      .join('')
    const root = document.createElement('div')
    root.innerHTML = html
    const links = [...root.querySelectorAll('a[data-affiliate-placement]')]
    expect(links.map((link) => link.getAttribute('data-affiliate-placement'))).toEqual([
      'summary',
      'article',
      'verdict',
    ])
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(original.review?.affiliateURL)
      expect(link.getAttribute('rel')).toContain('sponsored')
      expect(link.parentElement?.textContent).toContain('Affiliate link:')
      expect(link.textContent).toContain('opens in a new tab')
    }
    expect(root.textContent).toContain('Worth considering if')
  })

  it('places the middle link after the complete selected section', () => {
    const split = articleOfferSplit(post.content, post.review?.ctaAfterHeading)
    expect(post.content.root.children[split].type).toBe('heading')
    const html = renderToStaticMarkup(createElement(ArticleBody, post))
    expect(html.indexOf('keep comparing.')).toBeLessThan(html.indexOf('data-offer-placement'))
    expect(html.indexOf('data-offer-placement')).toBeLessThan(
      html.indexOf('Which details are still worth verifying?'),
    )
    expect(articleOfferSplit(post.content, 'Heading removed by editor')).toBe(-1)
    expect(articleOfferSplit(post.content, 'Our preliminary take')).toBe(-1)
  })

  it('keeps every contents anchor unique when headings repeat across the insertion', () => {
    const heading = original.content.root.children[0]
    const content = {
      ...original.content,
      root: { ...original.content.root, children: [heading, heading, heading, heading] },
    }
    const html = renderToStaticMarkup(
      createElement(ArticleBody, { content, review: original.review }),
    )
    const root = document.createElement('div')
    root.innerHTML = html
    const ids = [...root.querySelectorAll('h2[id]')].map((h) => h.id)
    expect(ids).toEqual(articleDetails(content).headings.map((h) => h.id))
    expect(new Set(ids).size).toBe(4)
  })

  it('does not advertise without a safe affiliate URL or interrupt a short article', () => {
    for (const affiliateURL of [undefined, '', 'javascript:alert(1)', 'http://example.com']) {
      const review = { ...post.review, affiliateURL }
      expect(renderToStaticMarkup(createElement(OfferCTA, { review, placement: 'verdict' }))).toBe(
        '',
      )
      expect(
        renderToStaticMarkup(createElement(ArticleBody, { content: post.content, review })),
      ).not.toContain('data-affiliate-placement')
    }
    const content = {
      ...post.content,
      root: { ...post.content.root, children: post.content.root.children.slice(0, 3) },
    }
    expect(articleOfferSplit(content)).toBe(-1)
  })

  it('preserves existing CMS content and links and does not duplicate editorial additions', () => {
    const result = improveReview(post)
    expect(result).toEqual({ review: post.review, content: post.content })
    expect(result.review?.affiliateURL).toBe(original.review?.affiliateURL)
    expect(result.review?.sources).toEqual(original.review?.sources)
    for (const node of original.content.root.children)
      expect(result.content.root.children).toContainEqual(node)
    for (const guide of supportingGuides) {
      const draft = supportingPost(guide)
      expect(draft._status).toBe('draft')
      expect(draft.review?.affiliateURL).toBeUndefined()
      expect(JSON.stringify(draft.content)).toContain(`/posts/${guide.reviewSlug}`)
    }
  })
})
