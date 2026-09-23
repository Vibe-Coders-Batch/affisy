import type { Post } from '@/payload-types'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { nodeText } from '@/utilities/article'

const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})
const element = (type: string, value: string, tag?: string) => ({
  type,
  ...(tag ? { tag } : {}),
  children: [text(value)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
})
type Section = { title: string; paragraphs: string[] }
const sectionNodes = (sections: Section[]) =>
  sections.flatMap(({ title, paragraphs }) => [
    element('heading', title, 'h2'),
    ...paragraphs.map((p) => element('paragraph', p)),
  ])
const editorState = (children: Post['content']['root']['children']): Post['content'] => ({
  root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 },
})

export const reviewImprovements: Record<
  string,
  {
    review: NonNullable<Post['review']>
    beforeHeading: string
    section: Section
  }
> = {
  'matsato-osuren-review': {
    review: {
      summary:
        'Shortlist the Osuren if its finger-hole grip is the feature you want to explore. For a first everyday knife, compare it with a conventional chef’s knife at the same delivered price before choosing.',
      bestFor:
        'You specifically want to try this grip, can confirm its dimensions, and are comfortable with the seller’s return conditions.',
      considerAlternative:
        'You want a familiar handle, a knife you can try in a store, or independently measured performance before buying.',
      linkLabel: 'See Matsato options & current price',
      ctaTitle: 'Interested in the Osuren’s grip?',
      ctaDescription:
        'Open the seller’s page to compare the available options. Check the size, quantity, delivered price and return conditions for your US order.',
      ctaAfterHeading: 'Osuren or a conventional chef’s knife?',
    },
    beforeHeading: 'Which details are still worth verifying?',
    section: {
      title: 'Osuren or a conventional chef’s knife?',
      paragraphs: [
        'Choose a comparison around the job you do most. If you mostly prepare vegetables and boneless ingredients for dinner, start by comparing one everyday knife with another. A distinctive shape needs to earn its place by fitting your hand and routine; the photograph alone cannot establish that.',
        'The Osuren belongs on your shortlist when the finger opening is something you actively want to explore. A conventional chef’s knife belongs there when a familiar handle matters more, or when you can try a comparable model locally. We have not tested either option against the other, so this is a way to narrow the decision, not a performance ranking.',
        'Before choosing a larger set, name the task each extra knife would do. If you cannot, compare the cost of one suitable knife with the set’s delivered price. Already own a knife that fits well? Consider whether care or sharpening would solve your problem before replacing it.',
        'Write down your maximum delivered price and the two details you will not compromise on—for example, handle fit and usable returns. If the seller’s answers meet those requirements, checking the current offer is a sensible next step. If an essential detail remains unknown, keep comparing.',
      ],
    },
  },
  'complete-plant-based-cookbook-review': {
    review: {
      summary:
        'Consider the main cookbook if you want plant-based meal ideas gathered in one digital collection. Pay for the bundle only if you can name an extra guide you will use; a handful of free recipes may be enough for occasional inspiration.',
      bestFor:
        'You enjoy cooking from a screen and want one collection to browse when planning meals.',
      considerAlternative:
        'You need a printed book, want to inspect complete recipes first, or only need one or two new dinner ideas.',
      linkLabel: 'Compare current cookbook packages',
      ctaTitle: 'Choose the collection you will actually open',
      ctaDescription:
        'Compare the main cookbook with the bundle on the seller’s page. Confirm the included files and final price before choosing a package.',
      ctaAfterHeading: 'Pay for the extras you will actually use',
    },
    beforeHeading: 'Five checks before buying a recipe ebook',
    section: {
      title: 'Make the decision in three questions',
      paragraphs: [
        'First, where will you cook from? If you prefer paper, confirm that the file format and printing terms work for you before buying a digital collection. If you already use a tablet or phone in the kitchen, think about whether browsing a single book would make meal planning easier.',
        'Second, what will you cook next week? Write down three meal styles your household already likes. Compare those with the seller’s examples or request a sample. We have not inspected the complete recipes, so we cannot confirm that a particular dish, portion size or measurement system is included.',
        'Third, which extra would you open first? If the answer is none, start by comparing the main cookbook with free recipes you already trust. If an additional guide covers something you regularly cook, compare the extra cost with how often you expect to use it. This gives the bundle a practical purpose beyond having more files.',
      ],
    },
  },
}

// Preserve CMS edits, media blocks, tracking URLs and sourcing. Re-running does not duplicate copy.
export function improveReview(post: Post): Pick<Post, 'review' | 'content'> {
  const improvement = reviewImprovements[post.slug || '']
  if (!improvement) throw new Error(`No editorial update for ${post.slug}`)
  const children = [...post.content.root.children]
  if (
    !children.some(
      (node) => node.type === 'heading' && nodeText(node) === improvement.section.title,
    )
  ) {
    const index = children.findIndex(
      (node) => node.type === 'heading' && nodeText(node) === improvement.beforeHeading,
    )
    if (index < 0)
      throw new Error(`Expected section missing in ${post.slug}; review the CMS edits first.`)
    children.splice(index, 0, ...sectionNodes([improvement.section]))
  }
  return {
    review: { ...post.review, ...improvement.review },
    content: { ...post.content, root: { ...post.content.root, children } },
  }
}

type DraftGuide = {
  slug: string
  title: string
  description: string
  summary: string
  intro: string
  sections: Section[]
  reviewSlug: string
  reviewLabel: string
}

export const supportingGuides: DraftGuide[] = [
  {
    slug: 'one-chefs-knife-or-knife-set',
    title: 'One chef’s knife or a knife set: what does your kitchen need?',
    description:
      'A practical way to choose between one everyday knife and a larger set, using your cooking routine, storage space and total budget.',
    summary:
      'Start with the tasks you cannot comfortably do with the knives you own. Buy a set only when its individual pieces solve those tasks and suit your storage space.',
    intro:
      'A knife set can look like a complete kitchen upgrade. A single chef’s knife can look expensive beside a box of several pieces. Neither comparison tells you what you will reach for on an ordinary evening. Start with what you cook, then decide how many knives deserve space in your kitchen.',
    reviewSlug: 'matsato-osuren-review',
    reviewLabel: 'Read our Matsato Osuren buying guide',
    sections: [
      {
        title: 'Write down the jobs, before the products',
        paragraphs: [
          'Think about your last three dinners. Which ingredients did you cut, and which knife did you reach for? Note any task that felt awkward. “I need something more comfortable for vegetables” is a useful shopping brief. “I need a professional set” leaves the actual problem unanswered.',
          'Next, look at what you own. A knife that fits your hand but needs attention presents a different decision from one whose size or shape you dislike. Compare the cost and practicality of maintenance with replacement before starting a new collection.',
        ],
      },
      {
        title: 'When one knife is the better starting point',
        paragraphs: [
          'Consider one everyday knife when you are equipping a small kitchen, replacing a particular knife, or still learning which shapes you enjoy. Putting your budget into one deliberately chosen item also lets you evaluate it before buying matching pieces.',
          'That does not mean one knife is suitable for every task. Read the manufacturer’s intended uses and restrictions. If a job needs a different tool, record it as a separate need instead of assuming that an expensive knife can do everything.',
        ],
      },
      {
        title: 'When a set deserves a closer look',
        paragraphs: [
          'A set is worth comparing when you can explain the purpose of several included pieces. Lay out a list of the knife types, sizes, accessories and storage included. Count the items you expect to use regularly, rather than relying on the number printed on the box.',
          'Imagine where the set would live. Measure the available storage space and check whether a block, covers or another storage solution is included. A set that solves several real needs may be convenient; unused pieces still need care and somewhere to go.',
        ],
      },
      {
        title: 'Use the same comparison sheet for both',
        paragraphs: [
          'For each candidate, record the delivered price, blade and handle dimensions, weight, stated materials, care instructions and return conditions. Keep any essential but missing detail marked “unknown.” This avoids giving a product credit for something its listing does not establish.',
          'If possible, compare how a similar size feels in your hand before ordering. For online purchases, confirm whether the return policy allows the evaluation you have in mind, who pays return postage, and where the item must be sent. Save the terms that apply to your order.',
        ],
      },
      {
        title: 'A simple decision for a small kitchen',
        paragraphs: [
          'Imagine you cook for one or two people and already own a small knife you like. Most of your frustration is with your larger knife, and drawer space is limited. In that situation, replacing the larger knife addresses a specific problem; a full set needs an additional reason to justify its cost and storage.',
          'Now imagine you are starting with no usable knives and already know the different tasks you need to cover. Comparing a suitable set against individually chosen tools becomes more useful. These examples are shopping scenarios, not product test results.',
        ],
      },
      {
        title: 'Ready to compare a particular design?',
        paragraphs: [
          'The Matsato Osuren is one design we have researched because of its finger-hole grip. Our guide explains the seller’s description, the information still worth checking and how to compare it with a conventional handle. It is not a hands-on performance test or a claim that this knife is the best choice.',
        ],
      },
    ],
  },
  {
    slug: 'plan-three-plant-based-dinners',
    title: 'Plan three plant-based dinners without buying a whole new pantry',
    description:
      'Build a small dinner plan around ingredients you already use, combine your shopping list, and decide whether you need a cookbook at all.',
    summary:
      'Choose three familiar meal formats, reuse a few ingredients, and shop from one combined list. You can try this planning method with free recipes or a cookbook you already own.',
    intro:
      'The difficult part of a new meal plan is often the shopping list: three appealing recipes can call for three mostly unrelated sets of ingredients. A smaller plan gives you a way to try new dinners without filling a cupboard with ingredients you might use only once.',
    reviewSlug: 'complete-plant-based-cookbook-review',
    reviewLabel: 'Compare the Complete Plant-Based Cookbook options',
    sections: [
      {
        title: 'Begin with what is already in the kitchen',
        paragraphs: [
          'Make a quick list of the ingredients you want to use. Think in groups: a grain or pasta, beans or another plant-based ingredient you enjoy, vegetables, and a sauce or seasoning. You do not need to buy every category again if you already have suitable ingredients.',
          'Pick one ingredient that will appear in more than one dinner. Keep your actual preferences in mind: a large bag of something nobody enjoys is not helpful just because several recipes call for it.',
        ],
      },
      {
        title: 'Choose three meal formats you already like',
        paragraphs: [
          'For example, your plan could be a rice bowl, a pasta dish and a wrap. One possible shopping overlap is bell peppers and spinach in all three, with chickpeas in the bowl and wrap, and a tomato-based sauce for the pasta. This is an illustration of ingredient planning, not three complete recipes or a nutrition plan.',
          'Choose actual recipes before shopping so you know the amounts, preparation steps and equipment needed. Match them to how many people you feed. Check ingredient labels and individual recipes for your dietary requirements; a plant-based description does not establish that a dish is suitable for every allergy.',
        ],
      },
      {
        title: 'Combine the list, then subtract what you own',
        paragraphs: [
          'Write the quantities from each recipe on one list. Add together ingredients that appear more than once, then subtract usable supplies already in your kitchen. Keep a note beside specialty ingredients that would be bought for only one dish.',
          'Before buying a one-use ingredient, look for an alternative recipe that fits your existing plan. If the original author offers a substitution, consider that option. Avoid assuming that every substitution works the same way, especially in baking.',
        ],
      },
      {
        title: 'Give each dinner a realistic place in the week',
        paragraphs: [
          'Read the whole recipe, including soaking, resting or other advance preparation. Put the most involved meal on an evening when you have time for it. Keep a familiar backup meal available so a busy day does not force you to abandon the whole plan.',
          'Planning ingredient overlap does not mean you must cook or store everything together. Follow the handling and storage directions for the foods you use and prepare quantities that suit your household. The purpose of the list is to make decisions easier, not to turn dinner into a large batch-cooking project.',
        ],
      },
      {
        title: 'Keep a short note after each meal',
        paragraphs: [
          'Record the time it actually took you, how many portions it made and whether you would cook it again. Note ingredients left over and what you could use them for next. These notes are more useful for your next shopping list than the number of recipes you managed to save.',
          'Repeat a meal you enjoyed before adding several unfamiliar dishes. Over time, your notes can become a short rotation of meals that fit your kitchen and schedule. There is no need to buy a new collection to try this method.',
        ],
      },
      {
        title: 'Would a digital cookbook make this easier?',
        paragraphs: [
          'Free recipes are a reasonable starting point when you only need three dinners. A cookbook is worth considering if you prefer browsing one organized collection and its style matches your household. A physical library book is another way to explore a style before purchasing.',
          'If you prefer a digital collection, our Complete Plant-Based Cookbook guide compares the seller’s described packages and explains what remains untested. The meal-planning example above is our own editorial suggestion; it is not taken from that cookbook and does not confirm that those meals appear in it.',
        ],
      },
    ],
  },
]

export function supportingPost(guide: DraftGuide): RequiredDataFromCollectionSlug<'posts'> {
  const link = {
    type: 'link',
    version: 3,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    fields: { linkType: 'custom', url: `/posts/${guide.reviewSlug}`, newTab: false },
    children: [text(guide.reviewLabel)],
  }
  return {
    title: guide.title,
    slug: guide.slug,
    _status: 'draft',
    meta: { title: guide.title, description: guide.description },
    review: {
      summary: guide.summary,
      basis:
        'An original ShoppeCove planning guide. Examples illustrate buying and meal-planning decisions; they are not hands-on product tests.',
    },
    content: editorState([
      element('paragraph', guide.intro),
      ...sectionNodes(guide.sections),
      { ...element('paragraph', ''), children: [link] },
    ]),
  }
}
