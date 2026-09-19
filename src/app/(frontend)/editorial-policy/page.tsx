import type { Metadata } from 'next'
import Link from 'next/link'
import { siteURL } from '@/utilities/site'
export const metadata: Metadata = {
  title: 'Our editorial approach | ShoppeCove',
  description: 'How ShoppeCove approaches product research, sources, and affiliate relationships.',
  alternates: { canonical: siteURL('/editorial-policy') },
}
export default function Page() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Our approach</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">
          Useful reading.
          <br />
          Considered choices.
        </h1>
        <div className="article-body prose mt-10 max-w-none">
          <p>
            ShoppeCove is a buying-guide publication for people researching products for their home
            and everyday life. We help readers identify useful questions, compare features, and
            understand purchase terms.
          </p>
          <h2>Research should have a clear basis</h2>
          <p>
            A guide based on published specifications is different from a hands-on review. Our
            articles should tell you which they are. Manufacturer descriptions are claims from the
            seller, and do not prove performance. We do not describe a product as personally tested
            unless the article includes real testing.
          </p>
          <h2>The trade-offs matter</h2>
          <p>
            Useful product coverage explains limitations as well as appealing features. Fit,
            dimensions, materials, maintenance, delivery costs, and return conditions can matter
            more than a discount headline.
          </p>
          <h2>Comfort claims are not medical evidence</h2>
          <p>
            We do not treat seller testimonials or advertising as proof of health benefits. Product
            guides are not medical advice. Claims about treating a medical condition require
            appropriate evidence.
          </p>
          <h2>How ShoppeCove earns</h2>
          <p>
            Some articles may contain affiliate links. A purchase through those links may earn us a
            commission. We identify those links and keep commercial relationships visible. Read our{' '}
            <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
          </p>
          <h2>Check the current details</h2>
          <p>
            Prices, availability, shipping, and refund policies can change. Always confirm these
            with the seller before ordering. Articles may be updated when new information is
            available.
          </p>
        </div>
      </div>
    </article>
  )
}
