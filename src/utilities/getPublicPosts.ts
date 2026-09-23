import config from '@payload-config'
import { getPayload, type Where } from 'payload'
import { unstable_cache } from 'next/cache'

export const publicPostsTag = 'public-post-cards'

// Only public card data enters this shared cache. Draft previews use their own queries.
// Keep the existing non-Cache-Components setup used by this Payload application.
export const getPublicPosts = unstable_cache(
  async (category = '', page = 1, limit = 12, query = '', id = '') => {
    const payload = await getPayload({ config })
    const where: Where = { _status: { equals: 'published' } }
    if (category) {
      const categories = await payload.find({
        collection: 'categories',
        where: { slug: { equals: category } },
        depth: 0,
        overrideAccess: false,
        limit: 1,
      })
      where.categories = { in: categories.docs.map(({ id }) => id) }
    }
    if (id) where.id = { equals: id }
    if (query) {
      where.or = ['title', 'meta.description', 'meta.title', 'slug'].map((field) => ({
        [field]: { like: query },
      }))
    }
    return payload.find({
      collection: 'posts',
      draft: false,
      overrideAccess: false,
      depth: 1,
      page,
      limit,
      sort: '-publishedAt',
      where,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        heroImage: true,
        publishedAt: true,
      },
    })
  },
  ['public-post-cards-v1'],
  { tags: [publicPostsTag], revalidate: 300 },
)
