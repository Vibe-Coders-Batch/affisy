import type { Post } from '@/payload-types'

const broadCategories = new Set(['buying-guides'])

export function relatedCategoryIDs(categories: Post['categories']): string[] {
  const records = (categories || []).flatMap((category) => {
    if (!category || typeof category === 'string')
      return category ? [{ id: category, slug: '' }] : []
    return [{ id: category.id, slug: category.slug || '' }]
  })
  const specific = records.filter((category) => !broadCategories.has(category.slug))
  const chosen = specific.length ? specific : records
  return [...new Set(chosen.map((category) => category.id))]
}
