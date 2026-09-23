import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'
import { revalidatePostCards, revalidateDeletedPostCards } from '@/hooks/revalidatePostCards'

export const Categories: CollectionConfig = {
  slug: 'categories',
  hooks: { afterChange: [revalidatePostCards], afterDelete: [revalidateDeletedPostCards] },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
