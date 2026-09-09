import type { Block } from 'payload'

export const AffiliateHome: Block = {
  slug: 'affiliateHome',
  interfaceName: 'AffiliateHomeBlock',
  labels: {
    singular: 'Affiliate Homepage',
    plural: 'Affiliate Homepages',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero',
      admin: { initCollapsed: false },
      fields: [
        { name: 'heroTitle', type: 'text', required: true },
        { name: 'heroDescription', type: 'textarea', required: true },
        {
          name: 'heroImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'heroCTA',
          type: 'group',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
        {
          name: 'trustPoints',
          type: 'array',
          maxRows: 3,
          fields: [
            {
              name: 'icon',
              type: 'select',
              defaultValue: 'book',
              options: [
                { label: 'Book', value: 'book' },
                { label: 'Chart', value: 'chart' },
                { label: 'People', value: 'people' },
              ],
              required: true,
            },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Articles',
      fields: [
        { name: 'featuredHeading', type: 'text', defaultValue: 'Featured article' },
        { name: 'featuredPost', type: 'relationship', relationTo: 'posts' },
        { name: 'latestHeading', type: 'text', defaultValue: 'Latest articles' },
        { name: 'latestLimit', type: 'number', defaultValue: 6, min: 1, max: 12 },
      ],
    },
    {
      type: 'collapsible',
      label: 'Category cards',
      fields: [
        { name: 'categoriesHeading', type: 'text', defaultValue: 'Explore by category' },
        {
          name: 'categoryCards',
          type: 'array',
          maxRows: 4,
          fields: [
            {
              name: 'icon',
              type: 'select',
              defaultValue: 'book',
              options: [
                { label: 'Book', value: 'book' },
                { label: 'Chart', value: 'chart' },
                { label: 'Star', value: 'star' },
                { label: 'Tools', value: 'tools' },
              ],
              required: true,
            },
            {
              name: 'tone',
              type: 'select',
              defaultValue: 'blue',
              options: [
                { label: 'Blue', value: 'blue' },
                { label: 'Green', value: 'green' },
                { label: 'Violet', value: 'violet' },
                { label: 'Orange', value: 'orange' },
              ],
              required: true,
            },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'linkLabel', type: 'text', defaultValue: 'View articles' },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Sidebar',
      fields: [
        {
          name: 'recommendation',
          type: 'group',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Recommended resource' },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
            { name: 'image', type: 'upload', relationTo: 'media' },
            {
              name: 'benefits',
              type: 'array',
              maxRows: 5,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'buttonLabel', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
            { name: 'disclosure', type: 'textarea', required: true },
          ],
        },
        {
          name: 'newsletter',
          type: 'group',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Join our newsletter' },
            { name: 'description', type: 'textarea' },
            { name: 'form', type: 'relationship', relationTo: 'forms' },
            { name: 'placeholder', type: 'text', defaultValue: 'Enter your email address' },
            { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe' },
            { name: 'privacyNote', type: 'text', defaultValue: 'No spam. Unsubscribe anytime.' },
          ],
        },
      ],
    },
  ],
}
