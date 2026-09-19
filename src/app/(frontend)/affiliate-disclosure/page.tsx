import type { Metadata } from 'next'
import { siteURL } from '@/utilities/site'
export const metadata: Metadata = {
  title: 'Affiliate disclosure | ShoppeCove',
  description: 'How affiliate links support ShoppeCove and what that means when you shop.',
  alternates: { canonical: siteURL('/affiliate-disclosure') },
}
export default function Page() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">A note on transparency</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">How affiliate links work.</h1>
        <div className="article-body prose mt-10 max-w-none">
          <p>
            ShoppeCove may earn a commission when you follow an affiliate link and make a purchase.
            This does not add an extra charge to your purchase.
          </p>
          <h2>Where you will see them</h2>
          <p>
            Links to a seller that can earn us a commission are accompanied by an affiliate
            disclosure. Informational links to sources may also appear in an article and are
            separate from purchase links.
          </p>
          <h2>Your purchase is with the seller</h2>
          <p>
            ShoppeCove is a separate publication, not the manufacturer or official store for
            products discussed here. The seller handles orders, payment, delivery, warranties, and
            returns. Check the full order total and current terms before purchasing.
          </p>
          <h2>Your decision comes first</h2>
          <p>
            A commission does not mean a product is right for every reader. Consider the limitations
            and alternatives described in an article, and look for evidence relevant to your own
            needs.
          </p>
        </div>
      </div>
    </article>
  )
}
