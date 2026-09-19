import type { RequiredDataFromCollectionSlug } from 'payload'

type Guide = Omit<RequiredDataFromCollectionSlug<'posts'>, 'categories'> & {
  topic: 'kitchen' | 'sleep-comfort' | 'buying-guides'
}
const text = (value: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})
function content(sections: [string, string][]) {
  return {
    root: {
      type: 'root',
      children: sections.flatMap(([title, body]) => [
        {
          type: 'heading',
          tag: 'h2',
          children: [text(title)],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
        ...body
          .split('\n\n')
          .map((value) => ({
            type: 'paragraph',
            children: [text(value)],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            version: 1,
          })),
      ]),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

// Research drafts: no invented testing, ratings, prices, or affiliate tracking IDs.
export const shoppecoveGuides: Guide[] = [
  {
    title: 'Matsato Osuren review: what to check before buying',
    slug: 'matsato-osuren-review',
    topic: 'kitchen',
    _status: 'draft',
    meta: {
      title: 'Matsato Osuren review: design, trade-offs & buying checks',
      description:
        'A research-based look at the Matsato Osuren knife: its finger-hole grip, the questions specs leave unanswered, and what to check before ordering.',
    },
    imageCaption:
      'AI-generated kitchen illustration. The knife shown is generic and is not a Matsato Osuren product photograph.',
    review: {
      basis:
        'This is a preliminary review of the seller’s published information, not a hands-on test. We have not independently measured sharpness, edge retention, or comfort.',
      summary:
        'The distinctive grip is the feature to investigate. Confirm the dimensions, care instructions, and return terms before deciding whether this knife fits your cooking style.',
      advantages: [
        {
          text: 'A finger-hole grip offers a different handle layout to consider if a conventional grip feels awkward.',
        },
        {
          text: 'The seller lists stainless steel and a wood handle, giving you a starting point for material comparisons.',
        },
      ],
      considerations: [
        {
          text: 'The seller’s performance claims have not been independently verified in this article.',
        },
        {
          text: 'A shaped grip may suit some hands better than others. Dimensions and a usable return policy matter.',
        },
      ],
      sources: [
        {
          title: 'Matsato Osuren — seller’s affiliate product overview',
          url: 'https://matsato-osuren.com/matsato-osuren/affiliates',
        },
      ],
    },
    content: content([
      [
        'What is the Matsato Osuren?',
        'Matsato markets the Osuren as a Japanese-style chef’s knife with a finger hole near the handle. Its affiliate overview describes a stainless-steel blade, a wood handle, and a sub-zero hardening process. These are descriptions from the seller, not findings from our own testing.\n\n“Japanese-style” describes positioning or design; it does not establish where a knife was made. If origin matters to your purchase, request a specific country-of-manufacture statement before ordering.',
      ],
      [
        'Start with the grip, not the discount',
        'An unusual handle can be appealing in a photograph without being comfortable in your hand. Think about how you already hold a kitchen knife: around the handle, with fingers closer to the blade, or with a pinch grip. Consider whether a fixed finger opening would suit that position.\n\nBefore buying online, ask for the overall weight, blade length, handle measurements, and dimensions of the opening. If those details are unavailable, treat fit as unresolved. A photo cannot answer whether the grip will be comfortable through a full meal’s preparation.',
      ],
      [
        'Which details are still worth verifying?',
        'A general phrase such as stainless steel does not tell you the exact steel grade or how the edge will behave. Ask for the steel specification, recommended sharpening method, and written care instructions. Keep claims about sharpness separate from evidence of how long an edge stays useful.\n\nFor a practical comparison, write down the same details for a conventional chef’s knife at a similar total price. Compare intended tasks, dimensions, maintenance, warranty, and return terms. Without equivalent information, a percentage discount is a poor basis for choosing between them.',
      ],
      [
        'Check the complete US purchase terms',
        'Review the final checkout total for one knife, including shipping and any accessories. Confirm the quantity selected and whether the order contains an optional bundle. Save the product description and return terms that apply on the day of purchase.\n\nLook for the return window, the address to which a return must be sent, who pays postage, and whether a used item can be returned. A money-back headline is less useful than a policy you can realistically use.',
      ],
      [
        'Our preliminary take',
        'The grip design makes the Osuren worth investigating for shoppers who specifically want that shape. We do not yet have the hands-on evidence needed to recommend it over a conventional chef’s knife. Buyers who prefer a familiar grip or want measured performance data should include alternatives in their comparison.\n\nA useful next step is to compare two or three knives on fit, published specifications, and the complete purchase cost. Choose only after the missing details that matter to you have been answered.',
      ],
    ]),
  },
  {
    title: 'Derila Ergo review: shape, fit, and the questions to ask',
    slug: 'derila-ergo-pillow-review',
    topic: 'sleep-comfort',
    _status: 'draft',
    meta: {
      title: 'Derila Ergo pillow review: shape, fit & purchase checks',
      description:
        'A research-based guide to the Derila Ergo memory foam pillow, with questions about contour, dimensions, care, and returns before buying.',
    },
    review: {
      basis:
        'This preliminary guide uses supplier materials provided to ShoppeCove. We have not slept on this pillow, independently verified its specifications, or evaluated medical claims.',
      summary:
        'Treat the butterfly contour as a fit preference to evaluate. Confirm the pillow’s height, dimensions, care requirements, and return eligibility before ordering.',
      advantages: [
        { text: 'The seller describes a contoured shape with space for different hand positions.' },
        {
          text: 'Memory foam construction may appeal to shoppers who prefer a shaped pillow over loose fill.',
        },
      ],
      considerations: [
        {
          text: 'The supplier description does not establish that the pillow will suit every sleeper.',
        },
        {
          text: 'We have not verified claims about pain relief, snoring, or sleep apnea and do not use them as a reason to recommend this product.',
        },
        {
          text: 'Confirm whether an opened or used pillow can be returned and what return shipping would cost.',
        },
      ],
      sources: [
        {
          title: 'Derila Ergo — seller’s product page',
          url: 'https://get-derila-ergo.com/derila-ergo/product?prodpv=9&hv=0&_=10373&vndr=evf&evf=1',
        },
      ],
    },
    content: content([
      [
        'What the supplier describes',
        'The supplier describes Derila Ergo as a high-density memory foam pillow with a butterfly-shaped contour and space for hand placement. It is presented as an updated version of the Derila pillow. Those details come from promotional material supplied to us and should be checked against the current product listing.\n\nThis article is a buying checklist, not a report of personal sleep results. We have not tested its feel, measured its dimensions, or compared it with other pillows under controlled conditions.',
      ],
      [
        'Think about fit before features',
        'Start with the pillow you already use. What would you change: its height, width, softness, shape, or the way it feels against your face? Writing down the problem gives you something concrete to compare with a new product.\n\nA shaped pillow has defined areas that may feel different from a flat pillow. Request the height at the center and edges, the overall dimensions, and whether the height or filling can be adjusted. If you often move around, consider how much usable space you prefer rather than assuming a contour will suit every position.',
      ],
      [
        'Ask about materials and maintenance',
        '“High-density” is a description, not a complete specification. Ask for the foam details and the seller’s description of firmness. If heat or fabric feel is important to you, check the cover material and whether a replacement cover is available.\n\nRead the care label for both the foam and cover. Do not assume the whole pillow can be machine washed because the cover is washable. Consider whether the maintenance routine matches how you normally care for bedding.',
      ],
      [
        'Separate comfort from health claims',
        'The supplied marketing includes claims about pain, snoring, and sleep apnea. We have not verified those claims and cannot draw conclusions about treatment from advertising or testimonials. This guide therefore assesses buying questions rather than medical outcomes.\n\nIf your reason for shopping is a medical concern, discuss that concern with a qualified clinician instead of relying on a product advertorial to decide what care you need.',
      ],
      [
        'Read the return policy before checkout',
        'Comfort is personal, so check whether you can evaluate the pillow and still return it. Look for restrictions on opened bedding, the length of the return window, how to request a return, the destination address, and who pays shipping.\n\nAt checkout, verify that the quantity and selected accessories match what you intended to buy. Compare the complete order total with other options, including any additional cover you might need. Save the terms and confirmation for your records.',
      ],
      [
        'Our preliminary take',
        'Derila Ergo may interest shoppers who specifically want to explore a shaped memory foam pillow, but the supplied promotional information is not enough for a tested recommendation. Fit, care, and practical return terms should guide the next stage of your research.\n\nBefore choosing it, compare at least one adjustable option and one pillow similar to what you already find comfortable. A familiar design may be a useful baseline when deciding whether a different contour offers something you actually want.',
      ],
    ]),
  },
  {
    title: 'Before you buy: a practical online-shopping checklist',
    slug: 'online-shopping-checklist',
    topic: 'buying-guides',
    _status: 'draft',
    meta: {
      title: 'An online-shopping checklist for more considered purchases',
      description:
        'Compare specifications, the full checkout cost, and return terms with this practical checklist for researching your next online purchase.',
    },
    review: {
      basis:
        'An editorial decision-making checklist. It does not endorse a particular seller or claim that a product has been tested.',
      summary:
        'Define what you need, compare like-for-like details, and read the complete purchase terms before placing an order.',
    },
    content: content([
      [
        'Define the job you need it to do',
        'Write one sentence describing why you are buying. For a kitchen knife, that might be “I need a comfortable knife for vegetables and everyday meal preparation.” For a pillow, it might be “I want a shape and feel I can evaluate at home with clear return terms.”\n\nThen make a short list of essentials and preferences. Keep the essentials specific enough to check: dimensions, materials, care requirements, or a maximum total cost. It becomes easier to pass on an attractive offer when it misses something on that list.',
      ],
      [
        'Make a like-for-like comparison',
        'Choose two or three plausible alternatives and record the same details for each. A useful comparison sheet has columns for model, dimensions, materials, included items, complete price, care, warranty, and returns. Mark missing information as unknown instead of filling it in from photographs.\n\nCheck that the model in a review is the model being sold. A review of an older version, a different size, or a bundle may not answer your questions about the current listing. Do not assume a shared brand name means identical specifications.',
      ],
      [
        'Read the evidence behind a recommendation',
        'Look for a clear explanation of how the article was made. Did the writer use the product, compare published specifications, or summarize seller material? Each can answer different questions, but a list of features is not proof of how a product performs.\n\nHelpful hands-on coverage describes the conditions of use and the limitations of the test. When an article has only promotional photos and broad praise, look for additional information before relying on its verdict. An affiliate disclosure tells you about the commercial relationship; it does not establish the quality of the research.',
      ],
      [
        'Calculate the price you will actually pay',
        'Write down the final cost for the quantity you need, including shipping and selected extras. Compare that total across the options. A larger advertised discount can still lead to a higher checkout price.\n\nBefore payment, inspect the basket for multiple units, accessories, or recurring charges. Remove anything you did not intend to purchase. If the final total exceeds your original budget, pause and decide whether the additional cost solves a need you identified earlier.',
      ],
      [
        'Make the return policy practical',
        'Find the return window, the condition an item must be in, the process for requesting a return, and the return destination. Check who pays postage and whether there are deductions or exclusions. Save a copy of the terms that apply to your order.\n\nFor products whose value depends on personal fit or feel, whether you can open and use the item is a particularly useful question. A generous-sounding return window does not help if the conditions prevent the evaluation you planned.',
      ],
      [
        'Leave room to decide later',
        'If a key specification or purchase term is missing, ask the seller for a written answer. If the answer does not arrive, keep that uncertainty in your comparison. You do not have to turn an incomplete listing into a purchase decision.\n\nKeep your notes after buying. Record what worked, what did not, and what you would ask next time. Your own experience can become a more useful shopping reference than another discount email.',
      ],
    ]),
  },
]
