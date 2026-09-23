import type { Post } from '@/payload-types'
import RichText from '@/components/RichText'
import { articleDetails, articleOfferSplit } from '@/utilities/article'
import { hasAffiliateLink, OfferCTA } from './OfferCTA'

export function ArticleBody({ content, review }: Pick<Post, 'content' | 'review'>) {
  const split = hasAffiliateLink(review) ? articleOfferSplit(content, review?.ctaAfterHeading) : -1
  const parts =
    split < 0
      ? [content]
      : [content.root.children.slice(0, split), content.root.children.slice(split)].map(
          (children) => ({
            ...content,
            root: { ...content.root, children },
          }),
        )
  const ids = articleDetails(content).headings.map(({ id }) => id)
  const offset = articleDetails(parts[0]).headings.length
  return (
    <>
      {parts.map((part, i) => (
        <div key={i}>
          {i === 1 && <OfferCTA review={review} placement="article" />}
          <RichText
            className="article-body max-w-none"
            data={part}
            articleHeadings
            headingIDs={i === 0 ? ids : ids.slice(offset)}
            enableGutter={false}
          />
        </div>
      ))}
    </>
  )
}
