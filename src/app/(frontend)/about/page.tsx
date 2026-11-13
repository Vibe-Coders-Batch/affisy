import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { generateMeta } from '@/utilities/generateMeta'
import { publication } from '@/utilities/publication'
import { site, siteURL } from '@/utilities/site'
import PageClient from '../[slug]/page.client'

export default async function AboutPage() {
  const { isEnabled: draft } = await draftMode()
  const page = await queryAboutPage()
  if (page) {
    return (
      <article className="pt-12 pb-20">
        <PageClient />
        {draft && <LivePreviewListener />}
        <RenderHero {...page.hero} />
        <RenderBlocks blocks={page.layout} />
      </article>
    )
  }
  return <AboutFallback />
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryAboutPage()
  if (page) return generateMeta({ doc: page })
  return {
    title: `About | ${site.name}`,
    description: `Who runs ${site.name}, how products are reviewed, and how affiliate links work.`,
    alternates: { canonical: siteURL('/about') },
  }
}

const queryAboutPage = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: 'about' } },
  })
  return (result.docs?.[0] as RequiredDataFromCollectionSlug<'pages'> | undefined) || null
})

function AboutFallback() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">About</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">About {site.name}.</h1>
        <p className="mt-6 border border-[#cdd3bf] bg-[#f1f3e9] p-4 text-sm leading-6 text-[#52604e]">
          Placeholder for the site owner to edit. Publish a Page in the admin with the slug “about”
          and this temporary copy is replaced.
        </p>
        <div className="article-body prose mt-10 max-w-none">
          <h2>Who runs this site</h2>
          <p>
            {site.name} is an independent product-research publication operated by{' '}
            {publication.operator}. Replace this sentence with the public description you want
            readers to see.
          </p>
          <h2>How products are reviewed</h2>
          <p>
            Articles describe publicly available seller information, labels, prices, and policies,
            and say when a product has not been purchased or tested. Replace this paragraph with the
            method you actually use.
          </p>
          <h2>Affiliate relationship</h2>
          <p>
            {site.name} may earn a commission if you buy through links on the site, at no extra cost
            to you. A commission does not decide the conclusion of an article. Read the{' '}
            <Link href="/affiliate-disclosure">affiliate disclosure</Link> for the full explanation.
          </p>
        </div>
      </div>
    </article>
  )
}
