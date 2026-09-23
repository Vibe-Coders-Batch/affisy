import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { ArticleBody } from '@/components/Editorial/ArticleBody'
import { OfferCTA, ReviewSummary } from '@/components/Editorial/OfferCTA'

import type { Post } from '@/payload-types'
import Link from 'next/link'
import { articleDetails, jsonLD } from '@/utilities/article'
import { site, siteURL, mediaURL } from '@/utilities/site'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const { headings } = articleDetails(post.content)
  const image = post.meta?.image || post.heroImage
  const imageURL = image && typeof image === 'object' ? mediaURL(image.url) : undefined
  const canonical = siteURL(url)
  const review = post.review
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${canonical}#article`,
        headline: post.title,
        description: post.meta?.description,
        mainEntityOfPage: canonical,
        url: canonical,
        datePublished: post.publishedAt || undefined,
        dateModified: post.updatedAt,
        ...(imageURL ? { image: [imageURL] } : {}),
        author: post.populatedAuthors?.some((a) => a.name)
          ? post.populatedAuthors
              .filter((a) => a.name)
              .map((a) => ({ '@type': 'Person', name: a.name }))
          : { '@type': 'Organization', name: site.name, url: site.url },
        publisher: { '@type': 'Organization', name: site.name, url: site.url },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteURL('/') },
          { '@type': 'ListItem', position: 2, name: 'The journal', item: siteURL('/posts') },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
        ],
      },
    ],
  }
  return (
    <article className="py-10 sm:py-14">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      {!draft && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLD(structuredData) }}
        />
      )}
      <PostHero post={post} />
      <div className="container mt-12 grid items-start gap-10 lg:grid-cols-[220px_minmax(0,740px)] lg:justify-center lg:gap-14">
        <aside className="lg:sticky lg:top-28">
          {!!headings.length && (
            <>
              <details className="border-y border-[#deded3] py-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-medium">Jump to a section</summary>
                <nav aria-label="In this article" className="mt-4">
                  <ol className="space-y-3">
                    {headings.map((h) => (
                      <li key={h.id} className={h.tag === 'h3' ? 'pl-3' : ''}>
                        <a href={`#${h.id}`} className="block py-1 text-sm text-[#626b60]">
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
              <nav
                aria-label="In this article"
                className="hidden border-y border-[#deded3] py-5 lg:block"
              >
                <h2 className="eyebrow mb-4">In this article</h2>
                <ol className="space-y-3">
                  {headings.map((h) => (
                    <li key={h.id} className={h.tag === 'h3' ? 'pl-3' : ''}>
                      <a
                        href={`#${h.id}`}
                        className="text-xs leading-5 text-[#626b60] hover:text-[#233d32]"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </>
          )}
          <p className="mt-5 text-xs leading-6 text-[#626b60]">
            Some links may earn us a commission at no additional cost to you.{' '}
            <Link href="/affiliate-disclosure" className="underline underline-offset-4">
              Read our disclosure.
            </Link>
          </p>
        </aside>
        <div className="min-w-0">
          {review?.basis && (
            <div className="mb-8 border-l-2 border-[#9aa883] pl-5 text-sm leading-7 text-[#626b60]">
              <strong className="text-[#233d32]">About this article. </strong>
              {review.basis}
            </div>
          )}
          <ReviewSummary review={review} />
          <ArticleBody content={post.content} review={review} />
          {!!(review?.advantages?.length || review?.considerations?.length) && (
            <section className="my-10 grid gap-6 sm:grid-cols-2">
              {[
                { title: 'What to like', items: review?.advantages },
                { title: 'What to consider', items: review?.considerations },
              ].map((group) =>
                group.items?.length ? (
                  <div key={group.title} className="border-t border-[#cdd3bf] pt-5">
                    <h2 className="font-editorial text-2xl">{group.title}</h2>
                    <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-[#626b60]">
                      {group.items.map((item) => (
                        <li key={item.id || item.text}>{item.text}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </section>
          )}
          <OfferCTA review={review} placement="verdict" />
          {!!review?.sources?.length && (
            <section className="mt-10 border-t border-[#deded3] pt-6">
              <h2 className="eyebrow">Sources & further reading</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {review.sources.map((source) => (
                  <li key={source.id || source.url}>
                    <a
                      href={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline underline-offset-4"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-14"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, collection: 'posts' })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
