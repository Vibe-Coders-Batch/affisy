import { ArrowUpRight } from 'lucide-react'
import type { Post } from '@/payload-types'

export function hasAffiliateLink(review: Post['review']) {
  try {
    return new URL(review?.affiliateURL || '').protocol === 'https:'
  } catch {
    return false
  }
}

export function OfferCTA({
  review,
  placement,
}: {
  review: Post['review']
  placement: 'summary' | 'article' | 'verdict'
}) {
  if (!hasAffiliateLink(review)) return null
  const compact = placement === 'summary'
  const dark = placement === 'verdict'
  return (
    <div
      data-offer-placement={placement}
      className={
        compact
          ? 'mt-6'
          : `not-prose my-10 border p-6 sm:p-8 ${dark ? 'border-[#233d32] bg-[#233d32] text-[#faf9f5]' : 'border-[#cdd3bf] bg-[#f1f3e9] text-[#233d32]'}`
      }
    >
      {!compact && (
        <>
          <p className={`eyebrow ${dark ? '!text-[#c9d2ba]' : ''}`}>Explore the product</p>
          <h2 className="font-editorial mt-2 text-2xl sm:text-3xl">
            {review?.ctaTitle || 'Does it fit your shortlist?'}
          </h2>
          <p className={`mt-3 text-sm leading-7 ${dark ? 'text-[#d9dfd1]' : 'text-[#626b60]'}`}>
            {review?.ctaDescription ||
              'See the current options, check the full cost, and read the seller’s return terms.'}
          </p>
        </>
      )}
      <a
        href={review!.affiliateURL!}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        data-affiliate-placement={placement}
        className={`inline-flex min-h-12 w-full items-center justify-center gap-3 px-5 py-3 text-center text-sm font-medium sm:w-auto ${compact ? '' : 'mt-5'} ${dark ? 'bg-[#faf9f5] text-[#233d32] hover:bg-[#e5eadb]' : 'bg-[#233d32] text-[#faf9f5] hover:bg-[#3c5744]'}`}
      >
        {review?.linkLabel || 'Check price & availability'}
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        <span className="sr-only"> (seller website, opens in a new tab)</span>
      </a>
      <p className={`mt-3 text-xs leading-5 ${dark ? 'text-[#d9dfd1]' : 'text-[#626b60]'}`}>
        Affiliate link: we may earn a commission if you buy, at no extra cost to you.
      </p>
    </div>
  )
}

export function ReviewSummary({ review }: { review: Post['review'] }) {
  if (!review?.summary) return null
  return (
    <section aria-label="Quick verdict" className="mb-10 bg-[#ecefe3] p-6 sm:p-8">
      <h2 className="eyebrow">The quick verdict</h2>
      <p className="font-editorial mt-3 text-2xl leading-snug">{review.summary}</p>
      {(review.bestFor || review.considerAlternative) && (
        <dl className="mt-6 grid gap-5 border-t border-[#cdd3bf] pt-5 sm:grid-cols-2">
          {[
            { title: 'Worth considering if', text: review.bestFor },
            { title: 'Consider another option if', text: review.considerAlternative },
          ].map(
            ({ title, text }) =>
              text && (
                <div key={title}>
                  <dt className="text-sm font-semibold">{title}</dt>
                  <dd className="mt-2 text-sm leading-6 text-[#52604e]">{text}</dd>
                </div>
              ),
          )}
        </dl>
      )}
      <OfferCTA review={review} placement="summary" />
    </section>
  )
}
