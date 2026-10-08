import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

export function ArticleImage({
  image,
  placement,
}: {
  image: MediaType
  placement: 'hero' | 'sidebar'
}) {
  const { width, height } = image
  const aspectRatio =
    width && height && width > 0 && height > 0 && Number.isFinite(width) && Number.isFinite(height)
      ? `${width} / ${height}`
      : '16 / 9'
  const hero = placement === 'hero'

  return (
    <div
      className="relative w-full bg-[#e9eadd]"
      style={{ aspectRatio, maxHeight: hero ? 'min(34rem, 70svh)' : '20rem' }}
    >
      <Media
        fill
        priority={hero}
        imgClassName="object-contain"
        videoClassName="absolute inset-0 h-full w-full object-contain"
        resource={image}
        size={hero ? '(max-width: 1024px) 100vw, 1024px' : '240px'}
      />
    </div>
  )
}
