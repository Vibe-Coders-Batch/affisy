import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  return (
    <footer className="mt-auto border-t border-[#deded3] bg-[#f0f0e8] text-[#233d32]">
      <div className="container grid gap-10 py-12 md:grid-cols-[1fr_1fr]">
        <div>
          <Link href="/" aria-label="ShoppeCove home">
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#626b60]">
            A little research. A better choice.
            <br />
            Useful reading for your home and everyday life.
          </p>
        </div>
        <div className="md:justify-self-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-sm">
            <Link href="/posts">The journal</Link>
            <Link href="/editorial-policy">Our approach</Link>
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
            {footerData.navItems?.map(({ link }, i) => (
              <CMSLink key={i} {...link} />
            ))}
          </nav>
          <p className="mt-6 max-w-lg text-xs leading-6 text-[#626b60]">
            ShoppeCove may earn a commission when you buy through affiliate links. Product prices,
            availability, shipping, and returns are determined by the seller.
          </p>
        </div>
      </div>
      <div className="container border-t border-[#d8dbd0] py-5 text-xs text-[#626b60]">
        © {new Date().getFullYear()} ShoppeCove. All rights reserved.
      </div>
    </footer>
  )
}
