import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

export function invalidatePostCards() {
  // Unpublished/deleted articles must leave the public cache immediately.
  revalidateTag('public-post-cards', { expire: 0 })
  revalidatePath('/')
  revalidatePath('/posts')
  revalidatePath('/search')
}

// Category labels and media records are populated into cached cards, too.
export const revalidatePostCards: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) invalidatePostCards()
  return doc
}
export const revalidateDeletedPostCards: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) invalidatePostCards()
  return doc
}
