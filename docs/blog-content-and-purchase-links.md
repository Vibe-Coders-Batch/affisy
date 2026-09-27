# Blog content and purchase links

## What changed

Product reviews now offer a seller link in the quick verdict, between complete article sections, and after the closing pros and cons. Buttons stay in the reading flow, use a full-width layout on small screens, and include a commission disclosure. Affiliate URLs are preserved exactly.

September 28 update: articles with a valid HTTPS affiliate link also show a sticky purchase card on the right at desktop widths of 1024px and above. It uses the article's existing image, product-link heading and explanation, plus a “Check price & buy” button. Generated illustrations retain a visible illustration label. The card stays 112px below the top edge while reading, stops at the article's lower boundary, and supports keyboard scrolling in short windows.

The contents list is collapsed above the text on mobile and smaller laptops. At 1280px and above, articles with purchase cards have contents on the left, text in the middle and the purchase card on the right. Mobile keeps the three existing inline placements without a floating overlay. Articles without a valid affiliate link keep their prior layout. Heading links still work when the article is split around the middle button, including repeated headings.

## Content prepared

The following were published on September 23, 2026, after user approval. Each review also links to its supporting guide through related posts.

- [Matsato Osuren review](articles/matsato-osuren-review.md): a clearer verdict, reader fit, and a comparison with a conventional knife or a set.
- [Complete Plant-Based Cookbook review](articles/complete-plant-based-cookbook-review.md): reader fit, package selection and three questions to guide the purchase.
- [One chef’s knife or a knife set](articles/one-chefs-knife-or-knife-set.md): an original supporting guide linking to the Matsato review.
- [Plan three plant-based dinners](articles/plan-three-plant-based-dinners.md): an original planning guide linking to the cookbook review.

Existing research disclosures, seller images, sources and affiliate URLs are retained. No new claims of product testing, sales results or scarcity were added. The supporting articles are original editorial examples, not recipes or findings taken from the products.

## Editing in Payload

In a post’s **Product guide & affiliate link** group:

- **At a glance** supplies the quick verdict.
- **Worth considering if** and **Consider another option if** explain reader fit.
- **Tracked affiliate URL** supplies every purchase placement. **Link label** controls the three inline links; the compact desktop card uses “Check price & buy”.
- **Product link heading** and **Product link explanation** supply the middle, closing and desktop sidebar cards.
- **Place the in-article product link after this section** takes the exact H2 heading. The link appears after the whole section, before the next H2. A missing or final heading suppresses the middle card. Blank uses the middle boundary for articles with at least four H2s; shorter articles keep the summary and closing links.

Articles without a valid HTTPS affiliate URL do not show seller buttons. Articles without a summary do not show the quick-verdict card.

## Publishing the work

For this release, the four prepared drafts were published immediately before the Git push so the deployment rebuilds public pages with the new content and layout. The publication script backs up the current drafts and public versions, preserves affiliate URLs and adds the supporting guides to the reviews’ related posts. Future edits can be published from Payload, which revalidates the affected pages.

The content is authored in `src/content/blog-improvements.ts`. The one-time import is available for another environment:

```sh
node --import tsx scripts/improve-blog.ts          # inspect the configured CMS, no writes
node --import tsx scripts/improve-blog.ts --apply  # back up and save drafts; never publish
```

The import requires the two existing reviews and the `kitchen` category. It preserves pending review drafts and existing supporting posts rather than overwriting editorial changes. Backups are in the ignored `.local-backups` directory. Public-copy verification ignores only transient Lexical block editor IDs.

After reviewing the saved drafts, the separate publication command is:

```sh
node --import tsx scripts/publish-blog-improvements.ts          # inspect the batch
node --import tsx scripts/publish-blog-improvements.ts --apply  # publish the four prepared articles
```

This local script disables Next.js revalidation because it runs outside the web server. Follow it with a deployment to refresh cached public pages and sitemaps.

## Measure before adding more buttons

The links expose `data-affiliate-placement="summary|article|verdict|sidebar"` for a future analytics integration. This change does **not** install analytics or record clicks. Affiliate tracking parameters have not been rewritten.

When analytics is connected, compare article visits and outbound clicks by placement. Use ClickBank reporting to examine attributed sales and refunds separately; an outbound click is not a sale. With low traffic, collect a useful baseline before drawing conclusions from small changes.

For the next content batch, stay close to these topics: choosing a kitchen knife online and deciding between a digital cookbook and free recipes. Use Search Console queries, when available, to prioritize updates. These are editorial topic ideas, not researched traffic forecasts.

## Validation

The September 28 sidebar update passed TypeScript, scoped ESLint and the five article-offer tests, extended to include sidebar tracking/disclosure and invalid-link suppression. Browser checks covered 1280px and 1024px desktop widths, a 500px-tall window, and 390px mobile. Measured scroll checks kept the card at 112px while the page moved; keyboard scrolling kept the button reachable in the short window; the card stopped above the footer; mobile had no sidebar overlay or horizontal overflow.

- TypeScript and the production build passed.
- Ten focused tests cover SEO, affiliate URL preservation, disclosures, insertion boundaries, repeated heading anchors, absent/invalid links and repeatable content updates.
- Changed TypeScript files passed ESLint.
- Local browser checks covered the published reviews with the new layout at desktop and phone sizes, working section navigation and absence of horizontal overflow. These pre-release browser checks used the previously published copy. Publication was separately verified through the CMS public read API.
