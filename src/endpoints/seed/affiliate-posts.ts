import type { Media, User } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

type Args = {
  author: User
  heroImage: Media
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function heading(text: string) {
  return {
    type: 'heading',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    tag: 'h2',
    version: 1,
  }
}

function post(
  args: Args,
  details: { description: string; intro: string; slug: string; title: string },
): RequiredDataFromCollectionSlug<'posts'> {
  return {
    title: details.title,
    slug: details.slug,
    _status: 'published',
    authors: [args.author.id],
    heroImage: args.heroImage.id,
    content: {
      root: {
        type: 'root',
        children: [
          heading(details.title),
          paragraph(details.intro),
          heading('Build a useful foundation'),
          paragraph(
            'Start with one audience, one clear problem, and a small collection of genuinely helpful content. Learn from reader questions and improve the site as evidence arrives.',
          ),
          heading('Choose trust over shortcuts'),
          paragraph(
            'Explain how recommendations were evaluated, disclose commercial relationships, and avoid promises that cannot be supported. Long-term credibility is the strongest growth asset.',
          ),
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    meta: {
      title: details.title,
      description: details.description,
      image: args.heroImage.id,
    },
    relatedPosts: [],
  }
}

export const affiliatePost1 = (args: Args) =>
  post(args, {
    title: 'How to Start Affiliate Marketing for Beginners',
    slug: 'start-affiliate-marketing-for-beginners',
    description:
      'A practical step-by-step guide to choosing a niche, creating useful content, and building your first affiliate marketing system.',
    intro:
      'Affiliate marketing works best when you help a specific audience make better decisions. This guide walks through the first steps without unrealistic income promises.',
  })

export const affiliatePost2 = (args: Args) =>
  post(args, {
    title: '7 Free Traffic Strategies for a New Affiliate Website',
    slug: 'free-traffic-strategies',
    description:
      'Seven sustainable ways to attract your first readers using search, communities, partnerships, and consistent publishing.',
    intro:
      'A new website does not need a large advertising budget. It needs focused distribution, useful content, and enough consistency to learn what attracts the right readers.',
  })

export const affiliatePost3 = (args: Args) =>
  post(args, {
    title: 'How to Evaluate an Affiliate Program Before You Join',
    slug: 'evaluate-affiliate-programs',
    description:
      'A clear framework for comparing product quality, commissions, attribution, support, and audience fit.',
    intro:
      'Commission rate is only one part of a strong affiliate partnership. Product quality, audience fit, tracking reliability, and customer experience matter just as much.',
  })
