import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPublicJournal } from '@/utilities/getPublicJournal'
import { getPublicPosts } from '@/utilities/getPublicPosts'
import { journalTopics } from '@/utilities/journalTopics'
import { PostGridSkeleton } from '@/components/Editorial/Loading'
import { PostCard } from '@/components/Editorial/PostCard'
import { site, siteURL } from '@/utilities/site'

type Args = { searchParams: Promise<{ category?: string; topic?: string; page?: string }> }

export default async function Page({ searchParams }: Args) {
  const { category = '', topic = '', page = '1' } = await searchParams
  if (!/^\d+$/.test(page) || !Number.isSafeInteger(Number(page)) || Number(page) < 1) notFound()
  const currentPage = Number(page)
  return (
    <div className="container py-12 sm:py-16">
      <p className="eyebrow">The ShoppeCove journal</p>
      <h1 className="font-editorial mt-4 text-5xl tracking-tight sm:text-6xl">
        A little research.
        <br />A better choice.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-8 text-[#626b60]">
        Practical guides and product research for your home, hobbies, pets, wellbeing, and digital
        life. Follow a topic that interests you and find a useful place to start.
      </p>
      <Suspense
        key={`topics:${category}:${topic}`}
        fallback={
          <div
            aria-hidden="true"
            className="my-10 flex flex-wrap gap-3 border-y border-[#deded3] py-5"
          >
            {[0, 1, 2, 3].map((item) => (
              <span key={item} className="h-9 w-32 animate-pulse rounded-full bg-[#eeefe5]" />
            ))}
          </div>
        }
      >
        <TopicNavigation category={category} topic={topic} />
      </Suspense>
      <Suspense key={`${category}:${topic}:${currentPage}`} fallback={<PostGridSkeleton />}>
        <PostResults category={category} topic={topic} currentPage={currentPage} />
      </Suspense>
    </div>
  )
}

async function TopicNavigation({ category, topic }: { category: string; topic: string }) {
  const journal = await getPublicJournal()
  const topics = [
    { slug: '', title: 'All stories', count: journal.posts.length },
    ...journal.topics.filter(({ count }) => count > 0),
  ]
  return (
    <nav
      aria-label="Article topics"
      className="my-10 flex flex-wrap gap-3 border-y border-[#deded3] py-5"
    >
      {topics.map((item) => {
        const active = item.slug ? topic === item.slug : !topic && !category
        return (
          <Link
            key={item.slug}
            href={item.slug ? `/posts?topic=${item.slug}` : '/posts'}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm ${active ? 'bg-[#233d32] text-[#faf9f5]' : 'border border-[#deded3] hover:bg-[#eeefe5]'}`}
          >
            {item.title}
            <span aria-hidden="true" className="text-xs opacity-70">
              {item.count}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

async function PostResults({
  category,
  topic,
  currentPage,
}: {
  category: string
  topic: string
  currentPage: number
}) {
  const posts = await getPublicPosts(category, currentPage, 12, '', '', topic)
  if (currentPage > Math.max(1, posts.totalPages)) notFound()
  const pageHref = (n: number) =>
    `/posts?${new URLSearchParams({ ...(category ? { category } : {}), ...(topic ? { topic } : {}), ...(n > 1 ? { page: String(n) } : {}) })}`.replace(
      /\?$/,
      '',
    )
  return (
    <>
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
    </>
  )
}

export async function generateMetadata({ searchParams }: Args): Promise<Metadata> {
  const { category = '', topic = '', page = '1' } = await searchParams
  const selectedTopic = journalTopics.find((item) => item.slug === topic)
  const legacyCategoryTitles: Record<string, string> = {
    kitchen: 'Kitchen & home',
    'sleep-comfort': 'Sleep & comfort',
    'buying-guides': 'Buying guides',
  }
  const title = selectedTopic?.title || legacyCategoryTitles[category] || 'The journal'
  const query = new URLSearchParams({
    ...(category ? { category } : {}),
    ...(topic ? { topic } : {}),
    ...(Number(page) > 1 ? { page: String(Number(page)) } : {}),
  }).toString()
  return {
    title: `${title}${Number(page) > 1 ? ` — Page ${Number(page)}` : ''} | ShoppeCove`,
    description: selectedTopic?.description || site.description,
    alternates: { canonical: siteURL(`/posts${query ? `?${query}` : ''}`) },
    ...(category || topic ? { robots: { index: false, follow: true } } : {}),
  }
}
