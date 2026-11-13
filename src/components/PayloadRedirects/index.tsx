import type React from 'react'
import type { Page, Post } from '@/payload-types'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirects'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

export async function redirectToStoredTarget(url: string) {
  const redirects = await getCachedRedirects()()
  const redirectItem = redirects.find((item) => item.from === url)
  if (!redirectItem) return

  if (redirectItem.to?.url) {
    redirect(redirectItem.to.url)
  }

  let redirectUrl: string

  if (typeof redirectItem.to?.reference?.value === 'string') {
    const collection = redirectItem.to?.reference?.relationTo
    const id = redirectItem.to?.reference?.value

    const document = (await getCachedDocument(collection, id)()) as Page | Post
    redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
      document?.slug
    }`
  } else {
    redirectUrl = `${redirectItem.to?.reference?.relationTo !== 'pages' ? `/${redirectItem.to?.reference?.relationTo}` : ''}/${
      typeof redirectItem.to?.reference?.value === 'object'
        ? redirectItem.to?.reference?.value?.slug
        : ''
    }`
  }

  if (redirectUrl) redirect(redirectUrl)
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  await redirectToStoredTarget(url)

  if (disableNotFound) return null

  notFound()
}
