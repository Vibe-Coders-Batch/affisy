import configPromise from '@payload-config'
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Star, Users, Wrench } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'
import type { Form, Media as MediaType, Post } from '@/payload-types'
import { NewsletterSignup } from './NewsletterSignup'

type IconName = 'book' | 'chart' | 'people' | 'star' | 'tools'

type Props = {
  categoriesHeading?: string | null
  categoryCards?: Array<{
    description: string
    icon: IconName
    id?: string | null
    linkLabel?: string | null
    title: string
    tone: 'blue' | 'green' | 'violet' | 'orange'
    url: string
  }> | null
  featuredHeading?: string | null
  featuredPost?: Post | string | null
  heroCTA: { label: string; url: string }
  heroDescription: string
  heroImage?: MediaType | string | null
  heroTitle: string
  latestHeading?: string | null
  latestLimit?: number | null
  newsletter: {
    buttonLabel?: string | null
    description?: string | null
    form?: Form | string | null
    heading?: string | null
    placeholder?: string | null
    privacyNote?: string | null
  }
  recommendation: {
    benefits?: Array<{ id?: string | null; text: string }> | null
    buttonLabel: string
    description: string
    disclosure: string
    heading?: string | null
    image?: MediaType | string | null
    title: string
    url: string
  }
  trustPoints?: Array<{
    description: string
    icon: 'book' | 'chart' | 'people'
    id?: string | null
    title: string
  }> | null
}

const iconMap = {
  book: BookOpen,
  chart: BarChart3,
  people: Users,
  star: Star,
  tools: Wrench,
}

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
}

function PostImage({ post, className }: { post: Post; className?: string }) {
  const image = post.meta?.image || post.heroImage

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className || ''}`}>
      {image && typeof image === 'object' ? (
        <Media
          fill
          imgClassName="object-cover"
          resource={image}
          size="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-slate-200" />
      )}
    </div>
  )
}

export async function AffiliateHomeBlock(props: Props) {
  const payload = await getPayload({ config: configPromise })
  const latestResult = await payload.find({
    collection: 'posts',
    depth: 1,
    draft: false,
    limit: props.latestLimit || 6,
    overrideAccess: false,
    sort: '-publishedAt',
  })

  const latestPosts = latestResult.docs
  let featured = typeof props.featuredPost === 'object' ? props.featuredPost : undefined

  if (!featured && typeof props.featuredPost === 'string') {
    featured = await payload.findByID({
      collection: 'posts',
      id: props.featuredPost,
      depth: 1,
      overrideAccess: false,
    })
  }

  featured ||= latestPosts[0]
  const recentPosts = latestPosts.filter((post) => post.id !== featured?.id).slice(0, 5)
  const newsletterForm = props.newsletter.form
  const formID =
    newsletterForm && typeof newsletterForm === 'object'
      ? newsletterForm.id
      : newsletterForm || undefined

  return (
    <section className="affiliate-home bg-white text-slate-950">
      <div className="container">
        <div className="relative isolate min-h-[430px] overflow-hidden rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
          <div className="absolute inset-0">
            {props.heroImage && typeof props.heroImage === 'object' ? (
              <Media fill imgClassName="object-cover" priority resource={props.heroImage} />
            ) : (
              <Image
                alt="A bright workspace with a laptop showing a growth chart"
                fill
                priority
                className="object-cover"
                src="/affiliate-hero.png"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/5" />
          </div>

          <div className="relative flex min-h-[430px] max-w-2xl flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
            <h1 className="max-w-xl text-4xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
              {props.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {props.heroDescription}
            </p>
            <div className="mt-7">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#ff5a47] px-6 py-3 font-bold text-white shadow-sm transition hover:bg-[#e94b39] hover:shadow-md"
                href={props.heroCTA.url}
              >
                {props.heroCTA.label} <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>

            {!!props.trustPoints?.length && (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {props.trustPoints.map((item) => {
                  const Icon = iconMap[item.icon]
                  return (
                    <div className="flex gap-3" key={item.id || item.title}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span>
                        <strong className="block text-sm">{item.title}</strong>
                        <span className="text-xs leading-5 text-slate-500">{item.description}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-10">
            {featured && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    {props.featuredHeading}
                  </h2>
                  <Link
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                    href="/posts"
                  >
                    View all posts →
                  </Link>
                </div>
                <article className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[46%_1fr]">
                  <PostImage className="min-h-64 md:min-h-full" post={featured} />
                  <div className="flex flex-col justify-center p-6 md:p-8">
                    <span className="mb-3 w-fit rounded bg-blue-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                      Featured guide
                    </span>
                    <h3 className="text-2xl font-extrabold leading-tight">
                      <Link href={`/posts/${featured.slug}`}>{featured.title}</Link>
                    </h3>
                    {featured.meta?.description && (
                      <p className="mt-3 leading-7 text-slate-600">{featured.meta.description}</p>
                    )}
                    <Link
                      className="mt-5 inline-flex items-center gap-1 font-bold text-blue-700"
                      href={`/posts/${featured.slug}`}
                    >
                      Read more <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </article>
              </section>
            )}

            {!!props.categoryCards?.length && (
              <section>
                <h2 className="mb-4 text-2xl font-extrabold tracking-tight">
                  {props.categoriesHeading}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {props.categoryCards.map((category) => {
                    const Icon = iconMap[category.icon]
                    return (
                      <article
                        className={`rounded-xl border p-5 text-center ${toneClasses[category.tone]}`}
                        key={category.id || category.title}
                      >
                        <span className="mx-auto grid size-11 place-items-center rounded-full bg-white/80">
                          <Icon aria-hidden className="size-5" />
                        </span>
                        <h3 className="mt-4 font-extrabold text-slate-950">{category.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {category.description}
                        </p>
                        <Link
                          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700"
                          href={category.url}
                        >
                          {category.linkLabel} <ArrowRight className="size-3" />
                        </Link>
                      </article>
                    )
                  })}
                </div>
              </section>
            )}

            {!!latestPosts.length && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-extrabold tracking-tight">{props.latestHeading}</h2>
                  <Link
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                    href="/posts"
                  >
                    View all posts →
                  </Link>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {latestPosts.slice(0, 6).map((post) => (
                    <article
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      key={post.id}
                    >
                      <PostImage className="aspect-[16/9]" post={post} />
                      <div className="p-5">
                        <h3 className="font-extrabold leading-snug">
                          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {post.meta?.description && (
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                            {post.meta.description}
                          </p>
                        )}
                        <Link
                          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700"
                          href={`/posts/${post.slug}`}
                        >
                          Read more <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-xl border border-amber-100 bg-amber-50/70">
              <h2 className="border-b border-amber-100 px-5 py-4 text-lg font-extrabold">
                {props.recommendation.heading}
              </h2>
              <div className="p-5">
                {props.recommendation.image && typeof props.recommendation.image === 'object' && (
                  <Media
                    className="mb-4 overflow-hidden rounded-lg"
                    resource={props.recommendation.image}
                  />
                )}
                <h3 className="text-xl font-extrabold">{props.recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {props.recommendation.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {props.recommendation.benefits?.map((benefit) => (
                    <li
                      className="flex gap-2 text-sm text-slate-700"
                      key={benefit.id || benefit.text}
                    >
                      <CheckCircle2
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      />{' '}
                      {benefit.text}
                    </li>
                  ))}
                </ul>
                <Link
                  className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#ff5a47] px-4 py-3 text-center font-bold text-white"
                  href={props.recommendation.url}
                  rel="sponsored nofollow"
                >
                  {props.recommendation.buttonLabel} <ArrowRight className="size-4" />
                </Link>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {props.recommendation.disclosure}
                </p>
              </div>
            </section>

            <section className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="text-lg font-extrabold">{props.newsletter.heading}</h2>
              {props.newsletter.description && (
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {props.newsletter.description}
                </p>
              )}
              <NewsletterSignup
                buttonLabel={props.newsletter.buttonLabel}
                formID={formID || undefined}
                placeholder={props.newsletter.placeholder}
                privacyNote={props.newsletter.privacyNote}
              />
            </section>

            {!!recentPosts.length && (
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="mb-4 text-lg font-extrabold">Recent posts</h2>
                <div className="divide-y divide-slate-100">
                  {recentPosts.map((post) => (
                    <Link
                      className="block py-3 text-sm font-semibold leading-5 hover:text-blue-700"
                      href={`/posts/${post.slug}`}
                      key={post.id}
                    >
                      {post.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
