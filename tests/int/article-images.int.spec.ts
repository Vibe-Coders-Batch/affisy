import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Media, Post } from '@/payload-types'
import type { Props as MediaProps } from '@/components/Media/types'
import { PostHero } from '@/heros/PostHero'
import { OfferSidebar } from '@/components/Editorial/OfferSidebar'

// Keep Media dispatch and VideoMedia real; isolate only Next's image optimizer.
vi.mock('@/components/Media/ImageMedia', () => ({
  ImageMedia: ({ resource, imgClassName, size, priority }: MediaProps) => {
    const image = resource && typeof resource === 'object' ? resource : undefined
    return createElement('img', {
      src: image?.url || '',
      alt: image?.alt || '',
      className: imgClassName,
      'data-size': size,
      'data-preload': priority,
    })
  },
}))

const trackedURL = 'https://example.com/offer?affiliate=keep-me&source=article'
const caption =
  'Seller-supplied product artwork, used with permission.\nThe pictured books and devices are mockups; this purchase includes digital downloads only.'
const image: Media = {
  id: 'original-image',
  url: 'https://cdn.example.com/original-product-artwork.webp',
  alt: 'The complete seller-supplied product artwork',
  width: 1200,
  height: 800,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
}
const post: Post = {
  id: 'article',
  title: 'A researched product guide',
  slug: 'researched-product-guide',
  content: {
    root: {
      type: 'root',
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  heroImage: image,
  imageCaption: caption,
  review: {
    affiliateURL: trackedURL,
    linkLabel: 'Compare the current package',
  },
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
}

function renderImages(article: Post = post) {
  const root = document.createElement('div')
  root.innerHTML =
    renderToStaticMarkup(createElement(PostHero, { post: article })) +
    renderToStaticMarkup(createElement(OfferSidebar, { post: article }))
  return root
}

describe('Article images and credits', () => {
  it.each([
    { width: 800, height: 1400, shape: 'portrait' },
    { width: 1600, height: 700, shape: 'landscape' },
    { width: 1000, height: 1000, shape: 'square' },
  ])('shows the full $shape source in both image placements', ({ width, height }) => {
    const root = renderImages({ ...post, heroImage: { ...image, width, height } })
    const images = [...root.querySelectorAll<HTMLImageElement>('figure img')]
    expect(images).toHaveLength(2)
    for (const renderedImage of images) {
      expect(renderedImage.getAttribute('src')).toBe(image.url)
      expect(renderedImage.getAttribute('alt')).toBe(image.alt)
      expect(renderedImage.classList.contains('object-contain')).toBe(true)
      expect(renderedImage.classList.contains('object-cover')).toBe(false)
      const frame = renderedImage.closest<HTMLDivElement>('[style]')
      expect(frame?.style.aspectRatio).toBe(`${width} / ${height}`)
      expect(frame?.style.maxHeight).toBeTruthy()
    }
  })

  it('contains supported portrait videos inside the bounded frame without overlapping their captions', () => {
    const videoCaption = 'Seller-supplied product demonstration. No personal test is shown.'
    const root = renderImages({
      ...post,
      heroImage: {
        ...image,
        mimeType: 'video/mp4',
        filename: 'portrait-product.mp4',
        width: 400,
        height: 1600,
      },
      imageCaption: videoCaption,
    })
    const videos = [...root.querySelectorAll<HTMLVideoElement>('figure video')]
    expect(videos).toHaveLength(2)
    expect(root.querySelector('figure img')).toBeNull()
    for (const video of videos) {
      expect(video.querySelector('source')?.getAttribute('src')).toBe('/media/portrait-product.mp4')
      expect(video.classList.contains('absolute')).toBe(true)
      expect(video.classList.contains('inset-0')).toBe(true)
      expect(video.classList.contains('h-full')).toBe(true)
      expect(video.classList.contains('w-full')).toBe(true)
      expect(video.classList.contains('object-contain')).toBe(true)
      const frame = video.closest<HTMLDivElement>('[style]')
      expect(frame?.style.aspectRatio).toBe('400 / 1600')
      expect(frame?.style.maxHeight).toBeTruthy()
    }
    expect(root.querySelector('header figcaption p')?.textContent).toBe(videoCaption)
    expect(root.querySelector('aside figcaption')?.textContent).toBe(videoCaption)
  })

  it('renders the complete ordinary credit beside both images without shortening it', () => {
    const root = renderImages()
    const heroCaption = root.querySelector('header figcaption')
    const sidebarCaption = root.querySelector('aside figcaption')
    expect(heroCaption?.querySelector('p')?.textContent).toBe(caption)
    expect(sidebarCaption?.textContent).toBe(caption)
    for (const credit of [heroCaption, sidebarCaption]) {
      expect(credit?.previousElementSibling?.querySelector('img')).not.toBeNull()
      expect(credit?.className).not.toMatch(/truncate|line-clamp/)
    }
  })

  it('preserves the entire AI illustration disclosure in both locations', () => {
    const aiCaption =
      'AI-generated editorial illustration. The pictured product is generic and does not depict a product test.'
    const root = renderImages({ ...post, imageCaption: aiCaption })
    expect(root.querySelector('header figcaption p')?.textContent).toBe(aiCaption)
    expect(root.querySelector('aside figcaption')?.textContent).toBe(aiCaption)
  })

  it('preserves affiliate destinations, tab behavior and disclosures, with a keyboard-focusable sidebar', () => {
    const root = renderImages()
    const heroLink = root.querySelector('a[data-affiliate-placement="hero"]')
    const sidebarLink = root.querySelector('a[data-affiliate-placement="sidebar"]')
    for (const link of [heroLink, sidebarLink]) {
      expect(link?.getAttribute('href')).toBe(trackedURL)
      expect(link?.getAttribute('rel')).toContain('sponsored')
      expect(link?.getAttribute('rel')).toContain('nofollow')
    }
    expect(heroLink?.getAttribute('target')).toBeNull()
    expect(sidebarLink?.getAttribute('target')).toBe('_blank')
    expect(sidebarLink?.getAttribute('rel')).toContain('noopener')
    expect(root.querySelector('header figcaption')?.textContent).toContain('Affiliate link:')
    expect(root.querySelector('aside')?.textContent).toContain('Affiliate link:')
    expect(root.querySelector('aside')?.getAttribute('tabindex')).toBe('0')
    expect(root.querySelector('aside')?.className).toContain('lg:overflow-y-auto')
    expect(root.querySelector('aside')?.className).toContain('lg:max-h-[calc(100dvh-8rem)]')
  })

  it('keeps image-less articles usable without displaying a detached caption', () => {
    const root = renderImages({ ...post, heroImage: null, meta: { image: null } })
    expect(root.querySelector('figure')).toBeNull()
    expect(root.textContent).not.toContain(caption)
    expect(root.querySelector('h1')?.textContent).toBe(post.title)
    expect(root.querySelector('a[data-affiliate-placement="sidebar"]')?.getAttribute('href')).toBe(
      trackedURL,
    )
  })

  it('uses the sidebar metadata fallback without dropping its caption, even without dimensions', () => {
    const root = renderImages({
      ...post,
      heroImage: null,
      meta: { image: { ...image, width: null, height: null } },
    })
    expect(root.querySelector('header figure')).toBeNull()
    const sidebarImage = root.querySelector<HTMLImageElement>('aside figure img')
    expect(sidebarImage?.getAttribute('src')).toBe(image.url)
    expect(sidebarImage?.classList.contains('object-contain')).toBe(true)
    expect(root.querySelector('aside figcaption')?.textContent).toBe(caption)
  })

  it('keeps an unlinked hero credit and hides the offer sidebar when no safe affiliate link exists', () => {
    const root = renderImages({ ...post, review: { affiliateURL: 'javascript:alert(1)' } })
    expect(root.querySelector('header figure img')).not.toBeNull()
    expect(root.querySelector('header figcaption p')?.textContent).toBe(caption)
    expect(root.querySelector('a[data-affiliate-placement]')).toBeNull()
    expect(root.querySelector('aside')).toBeNull()
  })
})
