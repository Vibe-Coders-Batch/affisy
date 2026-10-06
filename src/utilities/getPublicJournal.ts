import { unstable_cache } from 'next/cache'
import type { Post } from '@/payload-types'
import { publicPostsTag } from './getPublicPosts'
import { getPostTopics, journalTopics, type JournalTopic } from './journalTopics'

export type PublicJournalPost = Pick<
  Post,
  'id' | 'title' | 'slug' | 'categories' | 'meta' | 'heroImage' | 'publishedAt'
>
export type PublicJournalTopic = JournalTopic & { count: number }

export const getPublicJournal = unstable_cache(
  async (): Promise<{ posts: PublicJournalPost[]; topics: PublicJournalTopic[] }> => {
    const [{ default: config }, { getPayload }] = await Promise.all([
      import('@payload-config'),
      import('payload'),
    ])
    const payload = await getPayload({ config })
    const { docs: posts } = await payload.find({
      collection: 'posts',
      draft: false,
      overrideAccess: false,
      depth: 1,
      pagination: false,
      limit: 0,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        heroImage: true,
        publishedAt: true,
      },
    })

    const topicPosts = new Map(journalTopics.map(({ slug }) => [slug, new Set<string>()]))
    for (const post of posts) {
      for (const topic of getPostTopics(post)) topicPosts.get(topic.slug)?.add(post.id)
    }
    const topics = journalTopics
      .map((topic) => ({ ...topic, count: topicPosts.get(topic.slug)?.size ?? 0 }))
      .filter(({ count }) => count > 0)

    return { posts, topics }
  },
  ['public-journal-v1'],
  { tags: [publicPostsTag], revalidate: 300 },
)
