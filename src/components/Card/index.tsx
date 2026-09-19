import type { Post } from '@/payload-types'
import { PostCard } from '@/components/Editorial/PostCard'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>
export const Card = ({
  doc,
  className,
}: {
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}) =>
  doc ? (
    <div className={className}>
      <PostCard post={doc} />
    </div>
  ) : null
