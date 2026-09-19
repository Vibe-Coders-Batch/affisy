'use client'
import Link from 'next/link'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

export const HeaderClient = ({ data }: { data: Header }) => (
  <header className="sticky top-0 z-50 border-b border-[#deded3] bg-[#faf9f5]/95 text-[#233d32] backdrop-blur">
    <div className="container flex min-h-20 items-center justify-between gap-5">
      <Link aria-label="ShoppeCove home" href="/">
        <Logo />
      </Link>
      <HeaderNav data={data} />
    </div>
  </header>
)
