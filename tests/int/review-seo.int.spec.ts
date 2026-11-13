import { describe, expect, it } from 'vitest'
import { relatedCategoryIDs } from '@/utilities/relatedReviews'
import { publicMediaFileURL } from '@/utilities/publicMediaFile'
import { affiliateDisclosure } from '@/utilities/affiliateDisclosure'
import type { Post } from '@/payload-types'

describe('Related reviews and media URLs', () => {
  it('prefers a specific category over the broad buying-guides bucket', () => {
    const categories = [
      { id: 'broad', slug: 'buying-guides', title: 'Buying guides' },
      { id: 'wood', slug: 'woodworking', title: 'Woodworking' },
    ] as Post['categories']
    expect(relatedCategoryIDs(categories)).toEqual(['wood'])
    expect(
      relatedCategoryIDs([{ id: 'broad', slug: 'buying-guides' }] as Post['categories']),
    ).toEqual(['broad'])
  })

  it('points the media file route at the public bucket and rejects traversal', () => {
    const previous = process.env.R2_PUBLIC_URL
    process.env.R2_PUBLIC_URL = 'https://media.example.com/'
    expect(publicMediaFileURL('cover.webp')).toBe('https://media.example.com/cover.webp')
    expect(publicMediaFileURL('cover 1.webp', 'images')).toBe(
      'https://media.example.com/images/cover%201.webp',
    )
    expect(publicMediaFileURL('../secret.webp')).toBeUndefined()
    process.env.R2_PUBLIC_URL = previous
  })

  it('uses the public brand name in the post disclosure', () => {
    expect(affiliateDisclosure).toBe(
      'ShopperCove may earn a commission if you buy through links on this page, at no extra cost to you.',
    )
  })
})
