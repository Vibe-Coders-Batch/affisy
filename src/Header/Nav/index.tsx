'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <div className="flex min-w-0 items-center gap-6">
      <nav className="hidden items-center gap-6 lg:flex">
        {navItems.map(({ link }, i) => (
          <CMSLink
            className="text-sm font-semibold text-slate-700 hover:text-blue-700"
            key={i}
            {...link}
            appearance="link"
          />
        ))}
      </nav>
      <form action="/search" className="relative hidden xl:block">
        <label className="sr-only" htmlFor="site-search">
          Search articles
        </label>
        <input
          className="h-10 w-72 rounded-lg border border-slate-300 bg-white pl-4 pr-10 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="site-search"
          name="q"
          placeholder="Search articles..."
        />
        <button
          aria-label="Submit search"
          className="absolute right-0 top-0 grid size-10 place-items-center text-slate-600"
          type="submit"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>
      <Link
        aria-label="Search"
        className="grid size-10 place-items-center rounded-lg border border-slate-200 xl:hidden"
        href="/search"
      >
        <SearchIcon className="size-5" />
      </Link>
    </div>
  )
}
