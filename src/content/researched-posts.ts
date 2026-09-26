import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Post } from '@/payload-types'

type Node = Post['content']['root']['children'][number]
type Source = { title: string; url: string }

export type ResearchedArticle = {
  slug: string
  categorySlug: 'kitchen' | 'buying-guides'
  relatedSlugs: string[]
  seoTitle: string
  description: string
  review: NonNullable<Post['review']>
}

export const researchedArticles: ResearchedArticle[] = [
  {
    slug: 'small-woodworking-shop-setup',
    seoTitle: 'Small Woodworking Shop Setup: Plan Before You Buy',
    categorySlug: 'kitchen',
    relatedSlugs: [],
    description:
      'Plan a small woodworking shop around your projects, space, and budget. Compare buying priorities and decide whether Ultimate Small Shop fits your needs.',
    review: {
      summary:
        'Plan the space and your first projects before shopping for a complete workshop. A paid guide is an optional planning aid; evaluate its scope against free resources and your actual needs.',
      bestFor:
        'You want a practical checklist for planning a small home workshop and comparing a setup guide.',
      considerAlternative:
        'You need hands-on instruction, site-specific electrical work or professional safety advice.',
      basis:
        'An original ShoppeCove workshop-planning article based on public sales and affiliate pages checked September 26, 2026. We have not purchased or tested Ultimate Small Shop.',
      advantages: [
        { text: 'The seller describes several workshop-planning topics in one digital guide.' },
        {
          text: 'A single planning resource may suit readers who prefer an organized starting point.',
        },
      ],
      considerations: [
        { text: 'A seller’s budget or space claim is not a quote for your own workshop.' },
        {
          text: 'A general guide cannot assess your specific electrical, ventilation or tool-safety needs.',
        },
      ],
      affiliateURL: 'https://20d9490cwpln0s5mubbfmnvfqu.hop.clickbank.net/?&traffic_source=blog',
      linkLabel: 'Check the workshop guide’s current terms',
      ctaTitle: 'Compare the guide with your workshop plan',
      ctaAfterHeading: 'Where Ultimate Small Shop fits',
      ctaDescription:
        'Confirm what the guide covers, its current price, delivery format and purchase terms before deciding.',
    },
  },
  {
    slug: 'brain-training-for-dogs-review',
    seoTitle: 'Brain Training for Dogs Review: Is It Worth Considering?',
    categorySlug: 'buying-guides',
    relatedSlugs: [],
    description:
      'Considering Brain Training for Dogs? Compare its advertised course, price and refund terms with free training resources and decide what fits your needs.',
    review: {
      summary:
        'Consider it for organized home practice; begin with free guidance for a single basic skill and seek individual advice for serious behavior concerns.',
      bestFor: 'You want a learning sequence and can make time for consistent practice.',
      considerAlternative:
        'Your dog needs an individual assessment or you want a trainer to watch and adjust your technique.',
      basis:
        'Public-page research checked September 26, 2026. We have not purchased the course, accessed the member area, tested exercises or refunds, or independently verified the seller’s credentials.',
      advantages: [
        {
          text: 'A self-paced format may suit owners who want to practice around their own schedule.',
        },
        { text: 'An organized course may reduce the time spent choosing disconnected lessons.' },
      ],
      considerations: [
        { text: 'Seller claims do not establish results for an individual dog.' },
        {
          text: 'A prerecorded course is not a substitute for an individual behavioral assessment.',
        },
      ],
      affiliateURL: 'https://3303cov5-imh5n1-6vqm5z2d41.hop.clickbank.net/?&traffic_source=blog',
      linkLabel: 'Check the course details & current terms',
      ctaTitle: 'Does the course match the help you need?',
      ctaAfterHeading: 'Free guidance or a paid course?',
      ctaDescription:
        'Review the lesson outline, access terms, final price and refund conditions before choosing a course.',
    },
  },
  {
    slug: 'pianoforall-adult-beginners-guide',
    seoTitle: 'Pianoforall for Beginners: Cost, Format & Fit',
    categorySlug: 'buying-guides',
    relatedSlugs: [],
    description:
      'Considering Pianoforall? Compare its $49 course, learning format, device needs and limitations with free lessons and individual piano instruction.',
    review: {
      summary:
        'Worth considering if you want an organized, self-paced piano course and already have an instrument. Check the sample lesson and device requirements before buying.',
      bestFor:
        'You want a course sequence, prefer a one-time base purchase and are comfortable practicing independently.',
      considerAlternative:
        'You need individual feedback, are unsure whether you enjoy piano or want instruction tailored to a specific exam or performance goal.',
      basis:
        'Public product, FAQ, affiliate and access terms checked September 26, 2026, including the US ClickBank checkout. We have not purchased the course or tested its lessons, downloads or refund process.',
      advantages: [
        { text: 'The observed base course is a one-time digital purchase.' },
        { text: 'Public sample material lets you examine the teaching format before buying.' },
      ],
      considerations: [
        { text: 'The course price does not include a piano or keyboard.' },
        { text: 'Self-paced materials do not provide the same feedback as an individual teacher.' },
      ],
      affiliateURL: 'https://1197dj-7skkj2u1mk3ubixskd8.hop.clickbank.net/?&traffic_source=blog',
      linkLabel: 'Check Pianoforall’s current course & price',
      ctaTitle: 'Does the lesson format suit you?',
      ctaAfterHeading: 'Who is most likely to find the format useful?',
      ctaDescription:
        'Compare the sample, device requirements and current purchase terms with the way you want to learn.',
    },
  },
  {
    slug: '4-foot-farm-blueprint-guide',
    seoTitle: '4 Foot Farm Blueprint: What the $7 Guide Includes',
    categorySlug: 'kitchen',
    relatedSlugs: ['plan-three-plant-based-dinners'],
    description:
      'Explore what the $7 4 Foot Farm Blueprint includes, plan your space and supply costs, and compare the digital guide with free gardening resources.',
    review: {
      summary:
        'An optional low-cost planning guide for a small edible garden. Compare its organization with free Extension advice, and budget for supplies before deciding.',
      bestFor:
        'You want an organized starting point and can match a small growing project to your available space, light and routine.',
      considerAlternative:
        'You need local advice about a specific growing problem or already have a workable plan from free gardening resources.',
      basis:
        'Public seller and affiliate information, US ClickBank checkout and University of Maryland Extension guidance checked September 26, 2026. We have not purchased the Blueprint, inspected the paid plans or grown crops using it.',
      advantages: [
        { text: 'The observed $7 base purchase is digital, with no physical delivery required.' },
        { text: 'The advertised package groups several small-space growing topics in one place.' },
      ],
      considerations: [
        { text: 'Seeds, containers, growing media and other supplies are separate costs.' },
        { text: 'Results depend on the site, crop, season and care; savings are not guaranteed.' },
      ],
      affiliateURL: 'https://526c1mw92qrlvubzmdn80dfqcs.hop.clickbank.net/?&traffic_source=blog',
      linkLabel: 'Check the Blueprint’s current contents & price',
      ctaTitle: 'Would a structured plan help you start?',
      ctaAfterHeading: 'Paid plans or free Extension guidance?',
      ctaDescription:
        'Compare the current digital package and purchase terms with your growing plan and the free resources available to you.',
    },
  },
]

const textNode = (text: string, bold = false): Node => ({
  type: 'text',
  version: 1,
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text,
})
const element = (type: string, children: Node[], extra: Record<string, unknown> = {}): Node => ({
  type,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children,
  ...extra,
})

function linkURL(value: string) {
  if (/^\/(?!\/)/.test(value)) return value
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Unsupported link: ${value}`)
  return value
}

function inlineNodes(value: string, sources: Source[], bold = false): Node[] {
  const nodes: Node[] = []
  const tokens = /\*\*([^*]+)\*\*|\[([^\]\n]+)\]\(([^\s)]+)\)/g
  let cursor = 0
  for (const match of value.matchAll(tokens)) {
    if (match.index > cursor) nodes.push(textNode(value.slice(cursor, match.index), bold))
    if (match[1]) {
      nodes.push(...inlineNodes(match[1], sources, true))
    } else {
      const label = match[2]
      const url = linkURL(match[3])
      if (/^https?:/.test(url)) sources.push({ title: label, url })
      nodes.push(
        element('link', inlineNodes(label, sources, bold), {
          version: 3,
          fields: { linkType: 'custom', url, newTab: /^https?:/.test(url) },
        }),
      )
    }
    cursor = match.index + match[0].length
  }
  if (cursor < value.length) nodes.push(textNode(value.slice(cursor), bold))
  if (nodes.some((node) => node.type === 'text' && /\[[^\]]+\]\(|\*\*/.test(String(node.text)))) {
    throw new Error(`Unsupported or malformed Markdown: ${value}`)
  }
  return nodes
}

// Deliberately small Markdown subset used by this batch; unsupported block syntax fails loudly.
export function markdownArticle(markdown: string): {
  title: string
  content: Post['content']
  sources: Source[]
} {
  const lines = markdown.replace(/\r\n?/g, '\n').trim().split('\n')
  const title = /^# (.+)$/.exec(lines.shift() || '')?.[1]
  if (!title) throw new Error('Article must begin with one Markdown H1 title.')
  const children: Node[] = []
  const sources: Source[] = []
  let paragraph: string[] = []
  let bullets: Node[] = []
  const flushParagraph = () => {
    if (paragraph.length)
      children.push(element('paragraph', inlineNodes(paragraph.join(' '), sources)))
    paragraph = []
  }
  const flushBullets = () => {
    if (bullets.length)
      children.push(element('list', bullets, { listType: 'bullet', tag: 'ul', start: 1 }))
    bullets = []
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      flushBullets()
      continue
    }
    const heading = /^(#{2,3}) (.+)$/.exec(line)
    const bullet = /^- (.+)$/.exec(line)
    if (/^(?:# |#{4,}|```|>|\||\d+[.)] )/.test(line)) {
      throw new Error(`Unsupported Markdown block: ${line}`)
    }
    if (heading) {
      flushParagraph()
      flushBullets()
      children.push(
        element('heading', inlineNodes(heading[2], sources), { tag: `h${heading[1].length}` }),
      )
    } else if (bullet) {
      flushParagraph()
      bullets.push(
        element('listitem', inlineNodes(bullet[1], sources), { value: bullets.length + 1 }),
      )
    } else {
      flushBullets()
      paragraph.push(line)
    }
  }
  flushParagraph()
  flushBullets()
  if (!children.length) throw new Error(`Article is empty: ${title}`)
  return {
    title,
    content: {
      root: { type: 'root', version: 1, direction: 'ltr', format: '', indent: 0, children },
    },
    sources: [...new Map(sources.map((source) => [source.url, source])).values()],
  }
}

export async function loadResearchedPosts() {
  return Promise.all(
    researchedArticles.map(async (article) => {
      const file = fileURLToPath(new URL(`../../docs/articles/${article.slug}.md`, import.meta.url))
      const parsed = markdownArticle(await readFile(file, 'utf8'))
      const sources = [
        ...new Map(
          [...(article.review.sources || []), ...parsed.sources].map((source) => [
            source.url,
            { title: source.title, url: source.url },
          ]),
        ).values(),
      ]
      const data: RequiredDataFromCollectionSlug<'posts'> = {
        title: parsed.title,
        slug: article.slug,
        _status: 'draft',
        content: parsed.content,
        meta: { title: article.seoTitle, description: article.description },
        review: { ...article.review, sources },
      }
      return { article, file, data }
    }),
  )
}
