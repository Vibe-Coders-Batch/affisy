import { BarChart3 } from 'lucide-react'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={['inline-flex items-center gap-2 text-slate-950', className].join(' ')}>
      <span className="grid size-10 place-items-center rounded-lg bg-blue-700 text-white">
        <BarChart3 aria-hidden className="size-6" strokeWidth={2.5} />
      </span>
      <span className="leading-none">
        <strong className="block text-xl tracking-[-0.03em]">
          Affiliate<span className="text-blue-700">Path</span>
        </strong>
        <small className="mt-1 block text-[10px] font-medium tracking-[0.08em] text-slate-500">
          LEARN · GROW · EARN ONLINE
        </small>
      </span>
    </span>
  )
}
