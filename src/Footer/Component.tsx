import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:items-center md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <nav className="flex flex-wrap gap-4 text-sm">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-slate-600 hover:text-blue-700" key={i} {...link} />
            })}
          </nav>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AffiliatePath. Educational content only.
          </p>
        </div>
      </div>
    </footer>
  )
}
