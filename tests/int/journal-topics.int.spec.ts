import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Category, Post } from '@/payload-types'
import { getPublicJournal, type PublicJournalPost } from '@/utilities/getPublicJournal'
import { getPublicPosts } from '@/utilities/getPublicPosts'
import { getPostTopics, journalTopics, selectTopicPosts } from '@/utilities/journalTopics'

const { find, cache } = vi.hoisted(() => ({ find: vi.fn(), cache: vi.fn((fn) => fn) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('next/cache', () => ({ unstable_cache: cache }))

const category = (slug: string): Category => ({
  id: slug,
  title: slug,
  slug,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
const post = (
  id: string,
  slug: string,
  categorySlugs: string[] = [],
  publishedAt = '2026-01-01T00:00:00.000Z',
): PublicJournalPost => ({
  id,
  title: slug,
  slug,
  categories: categorySlugs.map(category),
  publishedAt,
})

beforeEach(() => {
  find.mockReset()
})

describe('Public journal topics', () => {
  it('assigns reviewed articles by subject before legacy categories', () => {
    expect(
      getPostTopics(
        post('music', 'pianoforall-adult-beginners-guide', ['engineering', 'software']),
      ).map(({ slug }) => slug),
    ).toEqual(['learning-hobbies'])
    expect(
      getPostTopics(post('song', 'custom-song-surprise-review', ['health-wellness'])).map(
        ({ slug }) => slug,
      ),
    ).toEqual(['digital-tools'])
    expect(
      getPostTopics(post('knife', 'matsato-osuren-review', ['woodworking'])).map(
        ({ slug }) => slug,
      ),
    ).toEqual(['food-kitchen'])
  })

  it('uses topical category aliases for new posts and ignores generic or unresolved categories', () => {
    expect(
      getPostTopics(post('new', 'new-home-guide', ['home-living', 'gardening'])).map(
        ({ slug }) => slug,
      ),
    ).toEqual(['home-garden'])
    expect(getPostTopics(post('generic', 'new-buying-guide', ['buying-guides']))).toEqual([])
    expect(getPostTopics({ slug: 'unknown', categories: ['unresolved-id'] })).toEqual([])
    expect(getPostTopics({ slug: 'unknown', categories: null })).toEqual([])
  })

  it('gives every curated slug one public topic without relying on its existing categories', () => {
    expect(journalTopics).toHaveLength(8)
    const slugs = journalTopics.flatMap(({ postSlugs }) => postSlugs)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const topic of journalTopics) {
      expect(topic.categorySlugs).not.toContain('buying-guides')
      for (const slug of topic.postSlugs) {
        expect(getPostTopics(post(slug, slug, ['buying-guides', 'kitchen']))).toEqual([topic])
      }
    }
  })

  it('selects one article per topic before filling from the newest remaining articles', () => {
    const posts = [
      post('knife-old', 'one-chefs-knife-or-knife-set', [], '2026-01-01'),
      post('knife-new', 'matsato-osuren-knife-review', [], '2026-10-01'),
      post('plant', 'plan-three-plant-based-dinners', [], '2026-09-01'),
      post('pets', 'brain-training-for-dogs-review', [], '2026-02-01'),
      post('music', 'singorama-review', [], '2026-03-01'),
      post('home', 'ryan-shed-plans-review', [], '2026-04-01'),
      post('home', 'ryan-shed-plans-review', [], '2026-04-01'),
    ]
    expect(selectTopicPosts(posts, 4).map(({ id }) => id)).toEqual([
      'knife-new',
      'home',
      'music',
      'pets',
    ])
    expect(selectTopicPosts(posts, 6, ['knife-new']).map(({ id }) => id)).toEqual([
      'plant',
      'home',
      'music',
      'pets',
      'knife-old',
    ])
    expect(selectTopicPosts(posts, 0)).toEqual([])
    expect(posts[0].id).toBe('knife-old')
  })

  it('counts unique public articles and hides empty topics using the existing invalidation tag', async () => {
    find.mockResolvedValue({
      docs: [
        post('knife', 'matsato-osuren-knife-review', ['woodworking']),
        post('knife', 'matsato-osuren-knife-review', ['woodworking']),
        post('home', 'new-home-guide', ['gardening', 'home-living']),
        post('generic', 'new-buying-guide', ['buying-guides']),
      ],
    })
    const result = await getPublicJournal()
    expect(result.topics.map(({ slug, count }) => ({ slug, count }))).toEqual([
      { slug: 'food-kitchen', count: 1 },
      { slug: 'home-garden', count: 1 },
    ])
    expect(cache).toHaveBeenCalledWith(expect.any(Function), ['public-journal-v1'], {
      tags: ['public-post-cards'],
      revalidate: 300,
    })
    expect(find).toHaveBeenCalledWith({
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
  })

  it('keeps public status, category, article ID, search, and topic constraints together', async () => {
    find
      .mockResolvedValueOnce({ docs: [{ id: 'legacy-category-id' }] })
      .mockResolvedValueOnce({ docs: [{ id: 'learning-category-id' }] })
      .mockResolvedValueOnce({ docs: [] })
    await getPublicPosts('engineering', 2, 6, 'piano', 'article-id', 'learning-hobbies')
    expect(find.mock.calls[1][0]).toMatchObject({
      collection: 'categories',
      where: { slug: { in: ['learning-hobbies'] } },
      overrideAccess: false,
      pagination: false,
      limit: 0,
    })
    const options = find.mock.calls[2][0]
    expect(options).toMatchObject({
      collection: 'posts',
      draft: false,
      overrideAccess: false,
      page: 2,
      limit: 6,
      where: {
        _status: { equals: 'published' },
        categories: { in: ['legacy-category-id'] },
        id: { equals: 'article-id' },
        or: [
          { title: { like: 'piano' } },
          { 'meta.description': { like: 'piano' } },
          { 'meta.title': { like: 'piano' } },
          { slug: { like: 'piano' } },
        ],
      },
    })
    const topicConstraint = options.where.and[0].or
    expect(topicConstraint[0].slug.in).toContain('pianoforall-adult-beginners-guide')
    expect(topicConstraint[1].and[0].slug.not_in).toEqual(
      journalTopics.flatMap(({ postSlugs }) => postSlugs),
    )
    expect(topicConstraint[1].and[1]).toEqual({ categories: { in: ['learning-category-id'] } })
  })

  it('matches curated articles despite old labels while allowing future topical articles', async () => {
    const fixtures: (PublicJournalPost & Pick<Post, '_status'>)[] = [
      { ...post('music', 'singorama-review', ['software']), _status: 'published' },
      { ...post('new', 'new-music-course', ['learning-hobbies']), _status: 'published' },
      {
        ...post('song', 'custom-song-surprise-review', ['learning-hobbies']),
        _status: 'published',
      },
      { ...post('draft', 'draft-music-course', ['learning-hobbies']), _status: 'draft' },
    ]
    find.mockImplementation(async (options) => {
      if (options.collection === 'categories') return { docs: [{ id: 'learning-hobbies' }] }
      return { docs: fixtures.filter((fixture) => matchesWhere(fixture, options.where)) }
    })
    const result = await getPublicPosts('', 1, 12, '', '', 'learning-hobbies')
    expect(result.docs.map(({ id }: { id: string }) => id)).toEqual(['music', 'new'])
  })

  it('returns no articles for an unknown topic instead of showing the entire journal', async () => {
    find.mockResolvedValue({ docs: [] })
    await getPublicPosts('', 1, 12, '', '', 'unknown-topic')
    expect(find).toHaveBeenCalledTimes(1)
    expect(find.mock.calls[0][0].where).toEqual({
      _status: { equals: 'published' },
      slug: { in: [] },
    })
  })
})

type TestWhere = {
  and?: TestWhere[]
  or?: TestWhere[]
  [field: string]: unknown
}

// Evaluate the emitted predicate against fixtures to exercise the interaction
// between curated matches, category fallbacks, and publication status.
function matchesWhere(doc: PublicJournalPost & Pick<Post, '_status'>, where: TestWhere): boolean {
  return Object.entries(where).every(([field, condition]) => {
    if (field === 'and') return (condition as TestWhere[]).every((part) => matchesWhere(doc, part))
    if (field === 'or') return (condition as TestWhere[]).some((part) => matchesWhere(doc, part))
    const value = doc[field as keyof typeof doc]
    const values: unknown[] = Array.isArray(value)
      ? value.map((item) => (typeof item === 'object' ? item.id : item))
      : [value]
    const rule = condition as { equals?: unknown; in?: unknown[]; not_in?: unknown[] }
    if ('equals' in rule) return values.includes(rule.equals)
    if (rule.in) return values.some((item) => rule.in?.includes(item))
    if (rule.not_in) return values.every((item) => !rule.not_in?.includes(item))
    return false
  })
}
