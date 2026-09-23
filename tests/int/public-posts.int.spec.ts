import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublicPosts } from '@/utilities/getPublicPosts'
import { revalidatePost, revalidateDelete } from '@/collections/Posts/hooks/revalidatePost'
import { revalidatePostCards, revalidateDeletedPostCards } from '@/hooks/revalidatePostCards'

const { find, cache, tag, path } = vi.hoisted(() => ({
  find: vi.fn(),
  cache: vi.fn((fn) => fn),
  tag: vi.fn(),
  path: vi.fn(),
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))
vi.mock('next/cache', () => ({ unstable_cache: cache, revalidateTag: tag, revalidatePath: path }))
beforeEach(() => {
  find.mockReset()
  tag.mockClear()
  path.mockClear()
})

describe('Public article listings', () => {
  it('caches only public card fields with bounded freshness', async () => {
    find.mockResolvedValue({ docs: [], totalPages: 0 })
    await getPublicPosts('', 2, 12, 'knife')
    expect(cache).toHaveBeenCalledWith(expect.any(Function), ['public-post-cards-v1'], {
      tags: ['public-post-cards'],
      revalidate: 300,
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        draft: false,
        overrideAccess: false,
        page: 2,
        where: { _status: { equals: 'published' }, or: expect.any(Array) },
        select: {
          title: true,
          slug: true,
          categories: true,
          meta: true,
          heroImage: true,
          publishedAt: true,
        },
      }),
    )
  })
  it('preserves category filtering and does not turn an unknown category into all stories', async () => {
    find.mockResolvedValueOnce({ docs: [] }).mockResolvedValueOnce({ docs: [] })
    await getPublicPosts('unknown')
    expect(find.mock.calls[1][0].where).toEqual({
      _status: { equals: 'published' },
      categories: { in: [] },
    })
  })
  it('expires listing caches immediately on unpublication and deletion', async () => {
    const req = { context: {}, payload: { logger: { info: vi.fn() } } }
    await revalidatePost({
      doc: { slug: 'knife', _status: 'draft' },
      previousDoc: { slug: 'knife', _status: 'published' },
      req,
    } as never)
    expect(tag).toHaveBeenCalledWith('public-post-cards', { expire: 0 })
    expect(path).toHaveBeenCalledWith('/posts/knife')
    tag.mockClear()
    await revalidateDelete({ doc: { slug: 'knife' }, req } as never)
    expect(tag).toHaveBeenCalledWith('public-post-cards', { expire: 0 })
  })
  it('invalidates populated media/category cards and respects script context', async () => {
    await revalidatePostCards({ doc: {}, req: { context: {} } } as never)
    expect(tag).toHaveBeenCalledWith('public-post-cards', { expire: 0 })
    tag.mockClear()
    await revalidateDeletedPostCards({ doc: {}, req: { context: {} } } as never)
    expect(tag).toHaveBeenCalledWith('public-post-cards', { expire: 0 })
    tag.mockClear()
    await revalidatePostCards({ doc: {}, req: { context: { disableRevalidate: true } } } as never)
    expect(tag).not.toHaveBeenCalled()
  })
})
