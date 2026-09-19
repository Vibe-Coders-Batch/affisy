import { Waves } from 'lucide-react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = ({ className = '' }: Props) => (
  <span className={`inline-flex items-center gap-2.5 text-[#233d32] ${className}`}>
    <Waves aria-hidden className="size-8" strokeWidth={1.6} />
    <span className="font-editorial text-[29px] leading-none tracking-[-0.06em]">
      ShoppeCove<span className="text-[#b7704f]">.</span>
    </span>
  </span>
)
