import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { Media } from '@/components/Media'
import type { Post } from '@/payload-types'

export type EditorialPost = Pick<Post, 'title' | 'slug' | 'meta' | 'categories'> &
  Partial<Pick<Post, 'heroImage' | 'publishedAt'>>

export function PostCard({ post, featured = false }: { post: EditorialPost; featured?: boolean }) {
  const image = post.heroImage || post.meta?.image
  const category = post.categories?.find((c) => typeof c === 'object')
  return (
    <article className={`editorial-card ${featured ? 'editorial-card-featured' : ''}`}>
      <Link
        href={`/posts/${post.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="editorial-card-image relative block overflow-hidden bg-[#e9eadd]"
      >
        {image && typeof image === 'object' ? (
          <Media
            fill
            resource={image}
            imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
            size={featured ? '(max-width: 768px) 100vw, 60vw' : '(max-width: 768px) 100vw, 33vw'}
          />
        ) : (
          <div className="flex h-full min-h-44 items-center justify-center text-[#73826e]">
            <BookOpen className="size-16" strokeWidth={0.8} />
          </div>
        )}
      </Link>
      <div className="editorial-card-copy">
        <p className="eyebrow">
          {category && typeof category === 'object' ? category.title : 'From the journal'}
        </p>
        <h3 className="font-editorial mt-3 text-2xl leading-tight tracking-tight">
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        {post.meta?.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#626b60]">
            {post.meta.description}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between gap-4 text-xs text-[#626b60]">
          <span>
            {post.publishedAt
              ? new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  timeZone: 'UTC',
                }).format(new Date(post.publishedAt))
              : 'Buying guide'}
          </span>
          <Link
            className="inline-flex items-center gap-2 font-medium text-[#233d32]"
            href={`/posts/${post.slug}`}
          >
            Read the story <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}
