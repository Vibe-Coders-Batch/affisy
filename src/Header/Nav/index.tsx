'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'

const links = [
  { href: '/posts', label: 'The journal' },
  { href: '/posts?category=kitchen', label: 'Kitchen & home' },
  { href: '/posts?category=sleep-comfort', label: 'Sleep & comfort' },
  { href: '/editorial-policy', label: 'Our approach' },
]

export const HeaderNav = ({ data }: { data: HeaderType }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm hover:text-[#a25a3c]">
            {link.label}
          </Link>
        ))}
        {data.navItems?.map(({ link }, i) => (
          <CMSLink key={i} {...link} className="text-sm" />
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/search" aria-label="Search articles" className="p-2">
          <Search className="size-5" strokeWidth={1.5} />
        </Link>
        <button
          className="p-2 lg:hidden"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-[#deded3] bg-[#faf9f5] px-6 py-5 shadow-sm lg:hidden"
        >
          {[...links].map((link) => (
            <Link
              className="block py-3"
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {data.navItems?.map(({ link }, i) => (
            <div className="py-3" key={i} onClick={() => setOpen(false)}>
              <CMSLink {...link} />
            </div>
          ))}
        </nav>
      )}
    </>
  )
}
