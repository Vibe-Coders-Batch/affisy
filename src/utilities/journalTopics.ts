import type { Post } from '@/payload-types'

export type JournalTopic = {
  slug: string
  title: string
  description: string
  categorySlugs: string[]
  postSlugs: string[]
}

// Existing categories include legacy assignments that do not describe the articles.
// Curated article matches take precedence; topical categories support new articles.
export const journalTopics: JournalTopic[] = [
  {
    slug: 'food-kitchen',
    title: 'Kitchen & food',
    description: 'Knife guides, plant-based cooking, and resources for everyday meals.',
    categorySlugs: ['kitchen'],
    postSlugs: [
      'matsato-osuren-knife-review',
      'matsato-osuren-review',
      'complete-plant-based-cookbook-review',
      'one-chefs-knife-or-knife-set',
      'plan-three-plant-based-dinners',
    ],
  },
  {
    slug: 'home-garden',
    title: 'Home & garden',
    description: 'Shed plans, landscaping, small homes, and practical planning guides.',
    categorySlugs: ['gardening', 'home-garden', 'home-living'],
    postSlugs: [
      'ryan-shed-plans-review',
      'shed-storage-inventory-size-door-needs',
      'ideas4landscaping-review',
      'garden-sun-shade-observation-map',
      '4-foot-farm-blueprint-guide',
      'tiny-house-made-easy-review',
      'tiny-house-floor-plan-permit-document-scope',
    ],
  },
  {
    slug: 'diy-projects',
    title: 'DIY & projects',
    description: 'Woodworking, CNC resources, boat plans, and project preparation.',
    categorySlugs: ['engineering', 'woodworking'],
    postSlugs: [
      'small-woodworking-shop-setup',
      'woodprofits-review',
      'woodworking-per-item-cost-record-worksheet',
      'diy-smart-saw-review',
      'cad-cam-g-code-cnc-resource-selection',
      'myboatplans-review',
      'canoe-vs-kayak-before-diy-boat-plans',
      'boat-alert-review',
      'boat-hin-vs-registration-number',
      'smart-water-box-review',
    ],
  },
  {
    slug: 'learning-hobbies',
    title: 'Learning & hobbies',
    description: 'Music courses, drawing, photography, and model railway guides.',
    categorySlugs: ['learning-hobbies'],
    postSlugs: [
      'pianoforall-adult-beginners-guide',
      'best-minor-pentatonic-course-review',
      'guitar-tabs-vs-scale-diagrams',
      'singorama-review',
      'online-singing-course-vs-vocal-coach',
      'pencil-drawing-made-easy-review',
      'recorded-drawing-course-vs-live-class',
      'trick-photography-special-effects-review',
      'beginners-guide-to-model-trains-review',
      'model-train-scale-vs-gauge-label-worksheet',
    ],
  },
  {
    slug: 'digital-tools',
    title: 'Digital tools & services',
    description: 'Animation software, explainer videos, and custom song services.',
    categorySlugs: ['software'],
    postSlugs: [
      'instadoodle-review',
      'screen-recording-vs-animated-explainer',
      'custom-song-surprise-review',
      'ai-custom-song-vs-human-songwriter',
    ],
  },
  {
    slug: 'pets',
    title: 'Pets',
    description: 'Research into dog training resources and cat behaviour products.',
    categorySlugs: ['pets'],
    postSlugs: ['brain-training-for-dogs-review', 'cat-spray-stop-review'],
  },
  {
    slug: 'health-wellness',
    title: 'Health & wellness',
    description: 'Supplement research, seller claims, ingredients, and buying considerations.',
    categorySlugs: ['health-wellness'],
    postSlugs: [
      'provadent-review',
      'sugar-defender-review',
      'venoplus-8-review',
      'ikaria-lean-belly-juice-review',
      'finessa-review',
      'audifort-review',
      'prostavive-review',
    ],
  },
  {
    slug: 'personal-growth',
    title: 'Mindset & personal growth',
    description: 'Research into mindset programmes and their advertised approaches.',
    categorySlugs: ['personal-growth'],
    postSlugs: ['forbidden-china-wealth-review', 'dubai-wealth-secret-review'],
  },
]

export function getPostTopics(post: Pick<Post, 'slug' | 'categories'>): JournalTopic[] {
  const curatedTopics = journalTopics.filter((topic) => topic.postSlugs.includes(post.slug))
  if (curatedTopics.length) return curatedTopics

  const categorySlugs = (post.categories ?? []).flatMap((category) =>
    typeof category === 'object' ? [category.slug] : [],
  )
  return journalTopics.filter((topic) =>
    topic.categorySlugs.some((slug) => categorySlugs.includes(slug)),
  )
}

export function selectTopicPosts<
  T extends Pick<Post, 'id' | 'slug' | 'categories' | 'publishedAt'>,
>(posts: readonly T[], limit: number, excludedIDs: string[] = []): T[] {
  const count = Math.max(0, Math.floor(limit))
  if (!count) return []

  const selected: T[] = []
  const selectedIDs = new Set(excludedIDs)
  const newest = [...posts].sort(
    (a, b) => (Date.parse(b.publishedAt ?? '') || 0) - (Date.parse(a.publishedAt ?? '') || 0),
  )
  const add = (post: T) => {
    selected.push(post)
    selectedIDs.add(post.id)
  }

  for (const topic of journalTopics) {
    if (selected.length >= count) break
    const post = newest.find(
      (candidate) =>
        !selectedIDs.has(candidate.id) &&
        getPostTopics(candidate).some(({ slug }) => slug === topic.slug),
    )
    if (post) add(post)
  }

  for (const post of newest) {
    if (selected.length >= count) break
    if (!selectedIDs.has(post.id)) add(post)
  }
  return selected
}
