import type { Form, Media, Post } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'

type HomeArgs = {
  featuredPost: Post
  metaImage: Media
  newsletterForm: Form
}

export const home = ({
  featuredPost,
  metaImage,
  newsletterForm,
}: HomeArgs): RequiredDataFromCollectionSlug<'pages'> => ({
  title: 'Home',
  slug: 'home',
  _status: 'published',
  hero: { type: 'none' },
  layout: [
    {
      blockName: 'AffiliatePath Homepage',
      blockType: 'affiliateHome',
      heroTitle: 'Learn Affiliate Marketing. Build Your Freedom.',
      heroDescription:
        'Step-by-step guides, honest reviews, and practical strategies to help you build a sustainable online business.',
      heroCTA: { label: 'Start learning today', url: '/posts' },
      trustPoints: [
        { icon: 'book', title: 'Beginner friendly', description: 'Simple, step-by-step guides' },
        { icon: 'chart', title: 'Honest reviews', description: 'Clear and independently written' },
        {
          icon: 'people',
          title: 'Practical strategies',
          description: 'Useful ideas you can apply',
        },
      ],
      featuredHeading: 'Featured article',
      featuredPost: featuredPost.id,
      latestHeading: 'Latest articles',
      latestLimit: 6,
      categoriesHeading: 'Explore by category',
      categoryCards: [
        {
          icon: 'book',
          tone: 'blue',
          title: 'Getting started',
          description: 'Learn the foundations of affiliate marketing.',
          linkLabel: 'View articles',
          url: '/posts',
        },
        {
          icon: 'chart',
          tone: 'green',
          title: 'Traffic strategies',
          description: 'Grow with search, content, and social media.',
          linkLabel: 'View articles',
          url: '/posts',
        },
        {
          icon: 'star',
          tone: 'violet',
          title: 'Product reviews',
          description: 'Detailed reviews built around real criteria.',
          linkLabel: 'View articles',
          url: '/posts',
        },
        {
          icon: 'tools',
          tone: 'orange',
          title: 'Tools & resources',
          description: 'Useful tools for building your online business.',
          linkLabel: 'View articles',
          url: '/posts',
        },
      ],
      recommendation: {
        heading: 'Recommended resource',
        title: 'The Affiliate Starter Toolkit',
        description:
          'A practical collection of templates and checklists for launching your first site.',
        image: metaImage.id,
        benefits: [
          { text: 'Step-by-step launch checklist' },
          { text: 'Content planning templates' },
          { text: 'Beginner-friendly workflows' },
          { text: 'Built for sustainable growth' },
        ],
        buttonLabel: 'View the resource',
        url: '/posts',
        disclosure:
          'Some links may be affiliate links. We may earn a commission at no additional cost to you.',
      },
      newsletter: {
        heading: 'Join our newsletter',
        description: 'Get practical guides and resources delivered to your inbox.',
        form: newsletterForm.id,
        placeholder: 'Enter your email address',
        buttonLabel: 'Subscribe',
        privacyNote: 'No spam. Unsubscribe anytime.',
      },
    },
  ],
  meta: {
    title: 'AffiliatePath — Learn, Grow, Earn Online',
    description:
      'Practical affiliate marketing guides, independent reviews, and useful tools for building an online business.',
    image: metaImage.id,
  },
})
