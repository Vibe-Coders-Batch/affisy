import type { Metadata } from 'next'
import Link from 'next/link'
import { publication } from '@/utilities/publication'
import { siteURL } from '@/utilities/site'

export const metadata: Metadata = {
  title: 'Privacy policy | ShoppeCove',
  description: 'How ShoppeCove handles contact messages, website requests, and affiliate links.',
  alternates: { canonical: siteURL('/privacy-policy') },
}

export default function Page() {
  return (
    <article className="container py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Your information</p>
        <h1 className="font-editorial mt-4 text-5xl tracking-tight">Privacy policy.</h1>
        <p className="mt-5 text-sm text-[#626b60]">
          Last updated{' '}
          <time dateTime={publication.policyUpdatedAt}>{publication.policyUpdatedLabel}</time>
        </p>
        <div className="article-body prose mt-10 max-w-none">
          <p>
            ShoppeCove is a blog and product-research publication operated by {publication.operator}
            . This policy covers information handled through this website. For privacy questions,
            contact{' '}
            <a className="break-words" href={`mailto:${publication.contactEmail}`}>
              {publication.contactEmail}
            </a>
            .
          </p>
          <h2>Information you choose to send</h2>
          <p>
            Our contact form asks for your name, email address, and message. A phone number is
            optional. Submitting the form saves those details in our contact records, which are
            accessible to authorized site administrators. The form does not currently send an email
            acknowledgement or an email notification to the operator. You can email the address
            above directly instead. The email address you submit may also appear in operational
            logs.
          </p>
          <p>
            If you email us, your email address, message, and any attachments you send are handled
            through our Gmail account. Google’s{' '}
            <a href="https://policies.google.com/privacy">privacy policy</a> describes its service’s
            information handling. Contact information is used to read and handle your enquiry.
            Please do not include payment credentials or sensitive medical information in a message.
          </p>
          <h2>Information needed to load the website</h2>
          <p>
            When you request a page, your browser sends technical information such as your IP
            address, the requested URL, and browser information to the services delivering the
            website. Search words appear in the search-page URL. Hosting and storage providers may
            process connection information to deliver content, maintain their services, and protect
            against abuse. Our media files are stored using Cloudflare R2; see Cloudflare’s{' '}
            <a href="https://www.cloudflare.com/privacypolicy/">privacy policy</a> for its service’s
            information handling.
          </p>
          <h2>Cookies, analytics, and email subscriptions</h2>
          <p>
            The current website does not include an analytics service, advertising pixel, or
            marketing email subscription service. Ordinary blog pages do not set analytics or
            advertising cookies in this configuration. Administrator sign-in and private article
            previews use functional cookies. You can manage cookies in your browser; blocking
            functional cookies may prevent those features from working.
          </p>
          <h2>Affiliate links and other websites</h2>
          <p>
            Articles may link to sellers, ClickBank, and other external websites. Following an
            affiliate link takes you to a separate service that may process referral information and
            use cookies to attribute a purchase. Its own privacy policy applies there. This website
            does not forward contact-form submissions to sellers or affiliate networks. Read our{' '}
            <Link href="/affiliate-disclosure">affiliate disclosure</Link> for more about these
            relationships.
          </p>
          <p>
            Purchases and payment details are handled on the seller’s checkout, rather than on
            ShoppeCove. Check the seller’s privacy, payment, and refund terms before ordering.
          </p>
          <h2>Storage and retention</h2>
          <p>
            Contact submissions remain in our contact records until the operator deletes them; there
            is currently no automatic expiry. Emails remain in the operator’s email account until
            deleted. Our hosting, storage, and email providers maintain their own service records
            under their respective policies. You can ask the operator to delete contact information
            you have supplied.
          </p>
          <h2>Privacy requests</h2>
          <p>
            To ask about, correct, or request deletion of information you sent us, email{' '}
            <a className="break-words" href={`mailto:${publication.contactEmail}`}>
              {publication.contactEmail}
            </a>
            . Describe your request and the email address used when contacting us. We may need to
            verify that the information belongs to you before disclosing or changing it. Your rights
            and any requirements to retain information depend on applicable law.
          </p>
          <h2>Changes to this policy</h2>
          <p>
            We will update this page if the website’s information-handling practices change. The
            date above identifies the current version. Our{' '}
            <Link href="/terms-and-conditions">terms and conditions</Link> explain use of the
            publication.
          </p>
        </div>
      </div>
    </article>
  )
}
