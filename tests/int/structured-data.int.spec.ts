import { describe, expect, it } from 'vitest'
import type { Post } from '@/payload-types'
import {
  faqEntries,
  homeStructuredData,
  postStructuredData,
  reviewedProductName,
} from '@/utilities/structuredData'
import { jsonLD } from '@/utilities/article'

const text = (value: string) => ({ type: 'text', text: value, children: [] })
const heading = (tag: string, value: string) => ({ type: 'heading', tag, children: [text(value)] })
const paragraph = (value: string) => ({ type: 'paragraph', children: [text(value)] })

const content = {
  root: {
    type: 'root',
    children: [
      heading('h2', 'What it is'),
      paragraph('A short introduction.'),
      heading('h2', 'Oral probiotic FAQ'),
      heading('h3', 'Does it work?'),
      paragraph('The evidence is limited.'),
      heading('h3', 'What does it cost?'),
      paragraph('Check the current price.'),
      heading('h2', 'Sources'),
      paragraph('Seller pages.'),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} as unknown as Post['content']

describe('Structured data', () => {
  it('builds FAQ pairs from the heading that follows an FAQ section', () => {
    expect(faqEntries(content)).toEqual([
      { question: 'Does it work?', answer: 'The evidence is limited.' },
      { question: 'What does it cost?', answer: 'Check the current price.' },
    ])
    expect(reviewedProductName('ProDentim Review (2026): Ingredients')).toBe('ProDentim')
    expect(reviewedProductName('Best Oral Probiotic Supplements (2026)')).toBeUndefined()
  })

  it('emits article, breadcrumb, review and FAQ data without inventing a rating', () => {
    const data = postStructuredData(
      {
        title: 'ProDentim Review (2026)',
        meta: { description: 'A research review.' },
        publishedAt: '2026-11-13T00:00:00.000Z',
        updatedAt: '2026-11-13T01:00:00.000Z',
        populatedAuthors: [{ name: 'Alex Editor' }],
        content,
        review: { summary: 'A cautious first look.', rating: 4 } as Post['review'],
      },
      'https://blogs.shoppercove.com/posts/prodentim-review',
    )
    const types = data['@graph'].map((node) => node['@type'])
    expect(types).toEqual(['BlogPosting', 'BreadcrumbList', 'Review', 'FAQPage'])
    const review = data['@graph'].find((node) => node['@type'] === 'Review')
    expect(review).toMatchObject({
      reviewBody: 'A cautious first look.',
      reviewRating: { ratingValue: 4, bestRating: 5 },
      itemReviewed: { '@type': 'Product', name: 'ProDentim' },
    })
    const serialized = jsonLD(data)
    expect(serialized).not.toContain('<')
    expect(JSON.parse(serialized)['@context']).toBe('https://schema.org')
  })

  it('describes the publication on the home page', () => {
    const home = homeStructuredData()
    expect(home['@graph'].map((node) => node['@type'])).toEqual(['Organization', 'WebSite'])
    expect(home['@graph'][0]).toMatchObject({ name: 'ShopperCove' })
  })
})
