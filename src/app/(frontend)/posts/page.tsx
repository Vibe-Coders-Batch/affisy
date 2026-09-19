import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import { PostCard } from '@/components/Editorial/PostCard'
import { siteURL } from '@/utilities/site'

type Args = { searchParams: Promise<{ category?: string; page?: string }> }
const topics = [
  { slug: '', title: 'All stories' },
  { slug: 'kitchen', title: 'Kitchen & home' },
  { slug: 'sleep-comfort', title: 'Sleep & comfort' },
  { slug: 'buying-guides', title: 'Buying guides' },
]

export default async function Page({ searchParams }: Args) {
  const { category = '', page = '1' } = await searchParams
  if (!/^\d+$/.test(page) || !Number.isSafeInteger(Number(page)) || Number(page) < 1) notFound()
  const currentPage = Number(page)
  const payload = await getPayload({ config: configPromise })
  const where: Where = { _status: { equals: 'published' } }
  if (category) {
    const categories = await payload.find({
      collection: 'categories',
      where: { slug: { equals: category } },
      depth: 0,
      overrideAccess: false,
      limit: 1,
    })
    where.categories = { in: categories.docs.map((c) => c.id) }
  }
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: currentPage,
    overrideAccess: false,
    sort: '-publishedAt',
    where,
  })
  if (currentPage > Math.max(1, posts.totalPages)) notFound()
  const pageHref = (n: number) =>
    `/posts?${new URLSearchParams({ ...(category ? { category } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`.replace(
      /\?$/,
      '',
    )
  return (
    <div className="container py-12 sm:py-16">
      <p className="eyebrow">The ShoppeCove journal</p>
      <h1 className="font-editorial mt-4 text-5xl tracking-tight sm:text-6xl">
        A little research.
        <br />A better choice.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[#626b60]">
        Buying guides, product research, and useful things to know before you bring something new
        home.
      </p>
      <nav
        aria-label="Article categories"
        className="my-10 flex flex-wrap gap-3 border-y border-[#deded3] py-5"
      >
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={topic.slug ? `/posts?category=${topic.slug}` : '/posts'}
            aria-current={category === topic.slug ? 'page' : undefined}
            className={`rounded-full px-5 py-2 text-sm ${category === topic.slug ? 'bg-[#233d32] text-[#faf9f5]' : 'border border-[#deded3] hover:bg-[#eeefe5]'}`}
          >
            {topic.title}
          </Link>
        ))}
      </nav>
      {posts.docs.length ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <PostCard post={post} key={post.id} />
          ))}
        </div>
      ) : (
        <div className="py-14">
          <h2 className="font-editorial text-3xl">More stories are on the way.</h2>
          <p className="mt-3 text-[#626b60]">There are no articles in this selection yet.</p>
          <Link href="/posts" className="mt-5 inline-block underline underline-offset-4">
            Browse all stories
          </Link>
        </div>
      )}
      {posts.totalPages > 1 && (
        <nav
          aria-label="Article pages"
          className="mt-12 flex items-center justify-center gap-6 border-t border-[#deded3] pt-7"
        >
          {posts.hasPrevPage && <Link href={pageHref(currentPage - 1)}>← Previous</Link>}
          <span className="text-sm">
            Page {currentPage} of {posts.totalPages}
          </span>
          {posts.hasNextPage && <Link href={pageHref(currentPage + 1)}>Next →</Link>}
        </nav>
      )}
    </div>
  )
}

export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { category = '', page = '1' } = await searchParams
  const topic = topics.find((t) => t.slug === category)?.title || 'The journal'
  const query = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(Number(page) > 1 ? { page: String(Number(page)) } : {}),
  }).toString()
  return {
    title: `${category ? topic : 'Buying guides & product research'}${Number(page) > 1 ? ` — Page ${Number(page)}` : ''} | ShoppeCove`,
    description:
      'Explore practical buying guides for kitchen tools, home essentials, and everyday comfort.',
    alternates: { canonical: siteURL(`/posts${query ? `?${query}` : ''}`) },
    ...(category ? { robots: { index: false, follow: true } } : {}),
  }
}
