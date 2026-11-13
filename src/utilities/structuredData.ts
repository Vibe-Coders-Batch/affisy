import type { Post } from '@/payload-types'
import { nodeText } from '@/utilities/article'
import { mediaURL, site, siteURL } from '@/utilities/site'

type Faq = { question: string; answer: string }
type HeadingNode = { type?: string; tag?: string; children?: unknown[]; text?: string }

const headingRank = (tag?: string) => Number(String(tag || 'h2').replace(/\D/g, '')) || 2

export function faqEntries(content?: Post['content'] | null): Faq[] {
  const nodes = (content?.root?.children || []) as HeadingNode[]
  const blockFaqs = nodes.flatMap((node) => {
    if (node.type !== 'block') return []
    const fields = (
      node as {
        fields?: { blockType?: string; questions?: { question?: string; answer?: string }[] }
      }
    ).fields
    if (fields?.blockType !== 'faq' || !Array.isArray(fields.questions)) return []
    return fields.questions.flatMap((item) => {
      const question = item.question?.trim()
      const answer = item.answer?.trim()
      return question && answer ? [{ question, answer }] : []
    })
  })
  if (blockFaqs.length) return blockFaqs

  const faqIndex = nodes.findIndex(
    (node) =>
      node.type === 'heading' &&
      /\bfaqs?\b/i.test(nodeText(node as Parameters<typeof nodeText>[0])),
  )
  if (faqIndex < 0) return []
  const faqRank = headingRank(nodes[faqIndex].tag)
  const entries: Faq[] = []
  let current: { question: string; parts: string[] } | null = null
  const flush = () => {
    if (!current) return
    const answer = current.parts.join(' ').replace(/\s+/g, ' ').trim()
    if (current.question && answer) entries.push({ question: current.question, answer })
    current = null
  }
  for (const node of nodes.slice(faqIndex + 1)) {
    if (node.type === 'heading') {
      const rank = headingRank(node.tag)
      const text = nodeText(node as Parameters<typeof nodeText>[0]).trim()
      if (rank <= faqRank && !text.endsWith('?')) {
        flush()
        break
      }
      flush()
      current = { question: text, parts: [] }
      continue
    }
    if (!current) continue
    const text = nodeText(node as Parameters<typeof nodeText>[0]).trim()
    if (text) current.parts.push(text)
  }
  flush()
  return entries
}

export function reviewedProductName(title?: string | null) {
  const match = title?.match(/^(.*?)\s+reviews?\b/i)
  const name = match?.[1]?.replace(/[:|\-–—]\s*$/, '').trim()
  if (!name || name.length < 2 || /^best\b/i.test(name)) return undefined
  return name
}

function ratingValue(review: Post['review']) {
  const value = review?.rating
  return typeof value === 'number' && value >= 1 && value <= 5 ? value : undefined
}

function authorEntities(post: Pick<Post, 'populatedAuthors'>) {
  const people = post.populatedAuthors?.filter((author) => author?.name) || []
  if (people.length) {
    return people.map((author) => ({ '@type': 'Person', name: author.name }))
  }
  return { '@type': 'Organization', name: site.name, url: site.url }
}

function publisher() {
  return {
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    logo: {
      '@type': 'ImageObject',
      url: siteURL('/images/journal-social.png'),
    },
  }
}

export function postStructuredData(
  post: Pick<
    Post,
    | 'title'
    | 'meta'
    | 'publishedAt'
    | 'updatedAt'
    | 'populatedAuthors'
    | 'heroImage'
    | 'content'
    | 'review'
  >,
  canonical: string,
) {
  const image = post.meta?.image || post.heroImage
  const imageURL = image && typeof image === 'object' ? mediaURL(image.url) : undefined
  const author = authorEntities(post)
  const product = reviewedProductName(post.title)
  const rating = ratingValue(post.review)
  const faqs = faqEntries(post.content)
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${canonical}#article`,
      headline: post.title,
      description: post.meta?.description || undefined,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      datePublished: post.publishedAt || undefined,
      dateModified: post.updatedAt,
      ...(imageURL ? { image: [imageURL] } : {}),
      author,
      publisher: publisher(),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: siteURL('/') },
        { '@type': 'ListItem', position: 2, name: 'The journal', item: siteURL('/posts') },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    },
  ]
  if (product && post.review?.summary) {
    graph.push({
      '@type': 'Review',
      '@id': `${canonical}#review`,
      name: post.title,
      reviewBody: post.review.summary,
      datePublished: post.publishedAt || undefined,
      author,
      url: canonical,
      ...(rating
        ? {
            reviewRating: {
              '@type': 'Rating',
              ratingValue: rating,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
      itemReviewed: {
        '@type': 'Product',
        name: product,
        url: canonical,
      },
    })
  }
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function homeStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': siteURL('/#organization'),
        name: site.name,
        url: site.url,
        logo: {
          '@type': 'ImageObject',
          url: siteURL('/images/journal-social.png'),
        },
      },
      {
        '@type': 'WebSite',
        '@id': siteURL('/#website'),
        name: site.name,
        url: site.url,
        description: site.description,
        publisher: { '@id': siteURL('/#organization') },
      },
    ],
  }
}
