import 'dotenv/config'

import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

type SeedOffer = {
  title: string
  slug: string
  status: 'draft' | 'published'
  vendor: string
  niche: string
  subniche: string
  category: string
  contentAngle: string
  editorial: {
    reviewStatus: string
    editorialStatus: string
    disclosure: string
    sourceDescriptionUnverified: string
    lastReviewed: string
  }
  links: {
    offerUrl: string
    affiliateToolsUrl: string
  }
  marketplace: {
    source: string
    snapshotDate: string
    selectionRank: number | null
    selectionScore: number | null
    marketplaceRank: number | null
    marketplaceScore: number | null
    gravity: number | null
    biGravity: number | null
    avgDollarsPerConversion: number | null
    initialDollarsPerConversion: number | null
    futureDollarsPerRebill: number | null
    totalRebillMetric: number | null
    netEpc: number | null
    conversionRate: number | null
    expectedReturnRate: number | null
    rebillEnabled: boolean
    upsellEnabled: boolean
    mobileEnabled: boolean
    cpaAvailable: boolean
    directTracking: string | null
    affiliateSupportEmail: string | null
    activateDate: string | null
  }
}

type LexicalTextNode = {
  type: 'text'
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  text: string
  version: 1
}

type LexicalBlock = {
  type: 'paragraph' | 'heading'
  children: LexicalTextNode[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
  tag?: 'h2' | 'h3'
  textFormat?: 0
}

const categorySlugs: Record<string, string> = {
  'Health & Wellness': 'health-wellness',
  'Self-Reliance & Green Living': 'self-reliance-green-living',
  'Relationships, Personal Growth & Spirituality':
    'relationships-personal-growth-spirituality',
  'Online Business, Affiliate Marketing & Digital Tools':
    'online-business-affiliate-marketing-digital-tools',
  'Home, Garden & DIY': 'home-garden-diy',
}

const seedPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'payload_offers_seed.json')
const offers = JSON.parse(await readFile(seedPath, 'utf8')) as SeedOffer[]

function textNode(text: string): LexicalTextNode {
  return {
    type: 'text',
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

function paragraph(text: string): LexicalBlock {
  return {
    type: 'paragraph',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

function heading(text: string, tag: 'h2' | 'h3' = 'h2'): LexicalBlock {
  return {
    type: 'heading',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag,
    version: 1,
  }
}

function money(value: number | null | undefined): string {
  return value == null ? 'Not available' : `$${value.toFixed(2)}`
}

function percent(value: number | null | undefined): string {
  return value == null ? 'Not available' : `${(value * 100).toFixed(2)}%`
}

function researchPost(
  offer: SeedOffer,
  categoryId: string,
): RequiredDataFromCollectionSlug<'posts'> {
  const m = offer.marketplace
  const title = `Research candidate: ${offer.title}`
  const description = `Editorial research candidate in ${offer.niche}. Review marketplace economics, audience fit, claims, and vendor terms before publication.`

  const children: LexicalBlock[] = [
    heading(title),
    paragraph(
      `This is a draft research record for ${offer.vendor}. It is not a published endorsement or a verified product review.`,
    ),
    paragraph(offer.editorial.disclosure),
    heading('Editorial direction'),
    paragraph(`Niche: ${offer.niche}. Sub-niche: ${offer.subniche || 'Not specified'}.`),
    paragraph(`Suggested angle: ${offer.contentAngle}.`),
    heading('ClickBank marketplace snapshot'),
    paragraph(
      `Selection rank: ${m.selectionRank ?? 'Not available'} · Marketplace rank: ${m.marketplaceRank ?? 'Not available'} · Selection score: ${m.selectionScore ?? 'Not available'}.`,
    ),
    paragraph(
      `Average commission per conversion: ${money(m.avgDollarsPerConversion)} · Initial commission: ${money(m.initialDollarsPerConversion)} · Future rebill payout per click: ${money(m.futureDollarsPerRebill)}.`,
    ),
    paragraph(
      `Net EPC: ${money(m.netEpc)} · Conversion rate: ${percent(m.conversionRate)} · Expected return rate: ${percent(m.expectedReturnRate)}.`,
    ),
    paragraph(
      `Rebill enabled: ${m.rebillEnabled ? 'Yes' : 'No'} · Upsell enabled: ${m.upsellEnabled ? 'Yes' : 'No'} · CPA available: ${m.cpaAvailable ? 'Yes' : 'No'}.`,
    ),
    heading('Pre-publication checks'),
    paragraph(offer.editorial.editorialStatus),
    paragraph(
      `Verify the sales page, affiliate terms, refund/return history, geographic eligibility, health or spiritual claims where applicable, and whether the offer is still active. Last marketplace review: ${offer.editorial.lastReviewed}.`,
    ),
    heading('Source notes — unverified vendor copy', 'h3'),
    paragraph(offer.editorial.sourceDescriptionUnverified || 'No source description provided.'),
    heading('Links', 'h3'),
    paragraph(`Offer page: ${offer.links.offerUrl}`),
    paragraph(`Affiliate tools: ${offer.links.affiliateToolsUrl}`),
  ]

  return {
    title,
    slug: `clickbank-${offer.slug}`,
    _status: 'draft' as const,
    content: {
      root: {
        type: 'root',
        children,
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    categories: [categoryId],
    relatedPosts: [],
    meta: {
      title,
      description,
    },
  }
}

const payload = await getPayload({ config })
const req = await createLocalReq({}, payload)
const categories = new Map<string, { id: string }>()

for (const [title, slug] of Object.entries(categorySlugs)) {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    pagination: false,
    req,
    where: { slug: { equals: slug } },
  })

  const category = existing.docs[0] ?? (await payload.create({
    collection: 'categories',
    data: { title, slug },
    depth: 0,
    req,
  }))

  categories.set(title, { id: category.id })
}

let created = 0
let updated = 0

for (const offer of offers) {
  const category = categories.get(offer.niche)

  if (!category) {
    throw new Error(`Missing category for niche: ${offer.niche}`)
  }

  const postData = researchPost(offer, category.id)

  const existing = await payload.find({
    collection: 'posts',
    limit: 1,
    pagination: false,
    req,
    where: { slug: { equals: postData.slug } },
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'posts',
      id: existing.docs[0].id,
      data: postData,
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
    updated += 1
  } else {
    await payload.create({
      collection: 'posts',
      data: postData,
      depth: 0,
      req,
      context: { disableRevalidate: true },
    })
    created += 1
  }
}

payload.logger.info(`ClickBank seed complete: ${offers.length} posts (${created} created, ${updated} updated).`)
await payload.destroy()
