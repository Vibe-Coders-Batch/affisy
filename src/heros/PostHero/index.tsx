import Link from 'next/link'
import { Clock3 } from 'lucide-react'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { articleDetails } from '@/utilities/article'
import { hasAffiliateLink } from '@/components/Editorial/OfferCTA'

export const PostHero = ({ post }: { post: Post }) => {
  const author = formatAuthors(post.populatedAuthors || []) || 'ShoppeCove editorial'
  const date = post.publishedAt
  const affiliateURL = hasAffiliateLink(post.review) ? post.review?.affiliateURL : undefined
  const hero = post.heroImage && typeof post.heroImage === 'object' && (
    <div className="relative aspect-[16/7] overflow-hidden bg-[#e9eadd]">
      <Media
        fill
        priority
        imgClassName="object-cover"
        resource={post.heroImage}
        size="(max-width: 1024px) 100vw, 1024px"
      />
    </div>
  )
  return (
    <header className="container">
      <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap gap-2 text-xs text-[#626b60]">
        <Link href="/">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/posts">The journal</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{post.title}</span>
      </nav>
      <div className="mx-auto max-w-4xl text-center">
        <div className="eyebrow flex flex-wrap justify-center gap-4">
          {post.categories?.map(
            (c) =>
              typeof c === 'object' && (
                <Link key={c.id} href={`/posts?category=${encodeURIComponent(c.slug || '')}`}>
                  {c.title}
                </Link>
              ),
          )}
        </div>
        <h1 className="font-editorial mt-5 text-4xl leading-[1.1] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>
        {post.meta?.description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#626b60]">
            {post.meta.description}
          </p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#626b60]">
          <span>By {author}</span>
          {date && (
            <time dateTime={date}>
              {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(date))}
            </time>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {articleDetails(post.content).readingMinutes} min read
          </span>
        </div>
      </div>
      {hero && (
        <figure className="mx-auto mt-10 max-w-5xl">
          {affiliateURL ? (
            <a
              href={affiliateURL}
              rel="sponsored nofollow noreferrer"
              data-affiliate-placement="hero"
              aria-label={`${post.review?.linkLabel || 'View product details'} (seller website)`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#233d32]"
            >
              {hero}
            </a>
          ) : (
            hero
          )}
          {(post.imageCaption || affiliateURL) && (
            <figcaption className="mt-2 space-y-1 text-xs leading-5 text-[#626b60]">
              {post.imageCaption && <p>{post.imageCaption}</p>}
              {affiliateURL && (
                <p>
                  Image opens the seller’s website. Affiliate link: we may earn a commission if you
                  buy, at no extra cost to you.
                </p>
              )}
            </figcaption>
          )}
        </figure>
      )}
    </header>
  )
}
