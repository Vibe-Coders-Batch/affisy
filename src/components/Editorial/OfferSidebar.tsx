import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { hasAffiliateLink, OfferCTA } from './OfferCTA'

export function OfferSidebar({
  post,
}: {
  post: Pick<Post, 'review' | 'heroImage' | 'meta' | 'imageCaption'>
}) {
  if (!hasAffiliateLink(post.review)) return null
  const image = post.heroImage || post.meta?.image

  return (
    <aside
      aria-labelledby="sidebar-offer-heading"
      tabIndex={0}
      className="hidden self-start border border-[#cdd3bf] bg-[#f1f3e9] p-5 text-[#233d32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#233d32] lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto xl:col-start-3 xl:row-span-1"
    >
      <p className="eyebrow mb-4">Explore the product</p>
      {image && typeof image === 'object' && (
        <figure className="mb-5">
          <div className="relative aspect-video overflow-hidden bg-[#e9eadd]">
            <Media fill resource={image} imgClassName="object-cover" size="280px" />
          </div>
          {post.imageCaption?.startsWith('AI-generated') && (
            <figcaption className="mt-2 text-[11px] leading-4 text-[#626b60]">
              AI-generated editorial illustration
            </figcaption>
          )}
        </figure>
      )}
      <h2 id="sidebar-offer-heading" className="font-editorial text-2xl leading-tight">
        {post.review?.ctaTitle || 'Ready to explore this product?'}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#626b60]">
        {post.review?.ctaDescription ||
          'See the current price, purchase options and return terms on the seller’s website.'}
      </p>
      <OfferCTA review={post.review} placement="sidebar" />
    </aside>
  )
}
