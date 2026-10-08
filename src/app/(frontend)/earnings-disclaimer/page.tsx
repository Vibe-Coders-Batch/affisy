import type { Metadata } from 'next'
import Link from 'next/link'
import { siteURL } from '@/utilities/site'
import { publication } from '@/utilities/publication'

export const metadata: Metadata = {
  title: 'Earnings disclaimer | ShoppeCove',
  description:
    'How to read income, profit, savings, and business-result claims in ShoppeCove product research.',
  alternates: { canonical: siteURL('/earnings-disclaimer') },
}

export default function Page() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">A note on expectations</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">Earnings disclaimer.</h1>
        <p className="mt-5 text-sm text-[#626b60]">
          Last updated{' '}
          <time dateTime={publication.policyUpdatedAt}>{publication.policyUpdatedLabel}</time>
        </p>
        <div className="article-body prose mt-10 max-w-none">
          <p>
            ShoppeCove publishes informational research about products, guides, and digital tools.
            We do not promise income, profit, savings, or business results from reading our articles
            or purchasing a product discussed here.
          </p>
          <h2>Claims are not typical outcomes</h2>
          <p>
            Seller success stories, earnings figures, projections, and savings calculations are
            their claims. Do not treat them as typical or independently verified outcomes. Your
            costs, skills, time, market demand, and changing conditions can affect results. A
            purchase does not ensure a return.
          </p>
          <h2>Understand the research basis</h2>
          <p>
            We do not imply that we bought, used, or personally tested a product unless the article
            explains that testing. Our articles are not personalized financial advice. Consider your
            own needs and costs, and check the evidence behind a seller’s claims before deciding.
          </p>
          <h2>Purchases and affiliate compensation</h2>
          <p>
            Your purchase is with the seller, who handles payment, delivery, and applicable return
            terms. ShoppeCove may receive a commission when you buy through an affiliate link. Read
            our <Link href="/affiliate-disclosure">affiliate disclosure</Link> for details and our{' '}
            <Link href="/terms-and-conditions">terms and conditions</Link> for using this website.
          </p>
        </div>
      </div>
    </article>
  )
}
