import type { Metadata } from 'next'
import Link from 'next/link'
import { publication } from '@/utilities/publication'
import { siteURL } from '@/utilities/site'

export const metadata: Metadata = {
  title: 'Terms and conditions | ShoppeCove',
  description: 'Terms for reading and using ShoppeCove’s articles, research, and affiliate links.',
  alternates: { canonical: siteURL('/terms-and-conditions') },
}

export default function Page() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Using the publication</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">Terms and conditions.</h1>
        <p className="mt-5 text-sm text-[#626b60]">
          Last updated{' '}
          <time dateTime={publication.policyUpdatedAt}>{publication.policyUpdatedLabel}</time>
        </p>
        <div className="article-body prose mt-10 max-w-none">
          <p>
            ShoppeCove is a blog and product-research publication operated by {publication.operator}
            . These terms cover use of this website and its content. Questions can be sent to{' '}
            <a className="break-words" href={`mailto:${publication.contactEmail}`}>
              {publication.contactEmail}
            </a>
            .
          </p>
          <h2>What our articles provide</h2>
          <p>
            Articles provide general information to help you research products, hobbies, and
            everyday decisions. A researched guide does not establish personal testing. Seller
            statements, testimonials, promotional artwork, and product mockups do not establish
            independent verification or typical results. Read each article’s stated research basis
            and limitations, and our <Link href="/editorial-policy">editorial approach</Link>.
          </p>
          <p>
            Content is not personalized medical, veterinary, legal, financial, or safety advice.
            Obtain advice appropriate to your circumstances from a qualified professional when
            needed. No article guarantees health benefits, relationship outcomes, income, savings,
            or business success. See our{' '}
            <Link href="/earnings-disclaimer">earnings disclaimer</Link>.
          </p>
          <h2>Check current product information</h2>
          <p>
            Prices, availability, contents, delivery methods, shipping charges, and return
            conditions can change after an article is written. Confirm current details directly with
            the seller before paying. We do not guarantee that every article is complete,
            error-free, or current, or that the website will always be available. You can report a
            correction using the contact email above.
          </p>
          <h2>Purchases and external websites</h2>
          <p>
            ShoppeCove does not sell the products described in its articles or process their orders.
            Your purchase agreement is with the seller or checkout provider. That provider handles
            payment, access or delivery, subscriptions, warranties, cancellations, and refunds under
            its own terms. Contact the seller or checkout support for order help.
          </p>
          <p>
            External websites have their own terms and privacy practices. A link does not guarantee
            the content, service, or suitability of its destination, or make ShoppeCove the
            manufacturer, seller, or an official representative of that business.
          </p>
          <h2>Affiliate relationships</h2>
          <p>
            We may earn a commission if you buy through an affiliate link, at no extra charge to
            you. These links are identified in articles. Read our{' '}
            <Link href="/affiliate-disclosure">affiliate disclosure</Link> before using them.
          </p>
          <h2>Using and sharing content</h2>
          <p>
            You may read the website and share links to its articles. Our original writing and
            website design are protected by applicable intellectual-property law. Product names,
            trademarks, and third-party artwork belong to their respective owners. Do not republish
            full articles or reuse third-party artwork without the necessary rights or permission.
            Any quotation must respect applicable law and identify its source.
          </p>
          <p>
            Do not interfere with the website, attempt unauthorized access, or use the contact form
            to send spam, malicious content, or another person’s private information without
            permission.
          </p>
          <h2>Privacy and updates</h2>
          <p>
            Our <Link href="/privacy-policy">privacy policy</Link> describes how website requests
            and contact information are handled. We may update these terms as the publication
            changes; the date above identifies this version. Nothing in these terms removes any
            rights or responsibilities that cannot be excluded under applicable law.
          </p>
        </div>
      </div>
    </article>
  )
}
