# ShoppeCove launch notes

## Positioning

ShoppeCove is a US-focused shopping journal for home, kitchen, and everyday comfort. The homepage leads readers into useful articles; seller links belong inside relevant articles with a visible disclosure. Start with Matsato Osuren and Derila Ergo. The EPC Workshop URL is a catalog, so select a specific product and evaluate its evidence before adding it.

## What is ready

- Magazine-style homepage, mobile menu, journal filters, and article layout.
- Article contents navigation, reading time, research basis, summary, considerations, sources, and optional affiliate CTA.
- Canonical URLs use `NEXT_PUBLIC_SITE_URL` (default `https://shoppecove.com`), independently of the development server address.
- Article and breadcrumb structured data; social metadata; published-only sitemaps; noindex for search, category filters, and draft previews.
- Matsato is published in the CMS with the supplied ClickBank HopLink and `traffic_source=blog`. Derila Ergo and the online-shopping checklist remain drafts. Website deployment is still a separate step.
- No invented ratings, hands-on results, prices, or tracked affiliate links. The kitchen hero is a labeled AI illustration and does not depict either advertised product.

The existing published affiliate-marketing demo posts were preserved. They currently populate the article listings. Replace or unpublish them through Payload when the shopper-facing articles are ready. Do not mix those demo topics into the long-term shopping publication.

## Publishing the first articles

1. Open `/admin`, then Posts. Matsato is published; keep Derila Ergo in draft as requested. Review the remaining drafts before publication. Add your real byline, approved product photographs with alt text, and verified dimensions, materials, care instructions, current US purchase terms, and relevant alternatives.
2. Add first-hand observations only after real testing; otherwise retain the research-based disclosure. Keep Derila medical claims out unless supported by appropriate evidence and review.
3. Generate your own ClickBank HopLink for the correct offer. Enter it in **Product guide & affiliate link → Tracked affiliate URL**. Do not use an affiliate recruitment page, creative-folder URL, or someone else's link as a purchase button. The CTA stays hidden when this field is empty.
4. Preview and publish each finished post. Choose its category and related posts. Set the homepage's featured post to the strongest published guide.
5. Confirm each HopLink resolves to the correct seller page and attributes to your account. Do not place a purchase merely to test attribution.

`pnpm setup:shoppecove` is a dry run. `node --import tsx scripts/setup-shoppecove.ts --apply` creates only missing draft guides/categories and updates only the recognized AffiliatePath template homepage. It preserves existing posts and backs up the homepage in the ignored `.local-backups/` directory. It is separate from the old destructive `seed:affiliate` command. Avoid the old seed command against a populated database.

## Before going live

- Connect the domain and HTTPS. During this work, `shoppecove.com` did not resolve in either the browser or the network check.
- Deploy this repository using the existing hosting setup. Set `NEXT_PUBLIC_SERVER_URL` and `NEXT_PUBLIC_SITE_URL` to `https://shoppecove.com` in production.
- Review the site's existing contact and privacy pages. The current app has no email adapter configured, so newsletter delivery is not ready; the new homepage does not display a signup promise.
- Verify Search Console ownership and submit `/sitemap.xml` after deployment. Review actual indexing, search queries, and clicks before expanding content.
- Test a published article, images, mobile navigation, canonical URL, structured data, and affiliate CTA on the production domain.

## Initial content focus

Publish a small set of substantial, connected articles before adding more unrelated offers:

| Topic | Reader's question | Evidence to add |
| --- | --- | --- |
| Matsato Osuren review | Does this design suit my cooking? | Exact specifications, actual grip experience, equivalent alternatives, purchase terms |
| Chef's knife buying guide | Which features matter for everyday prep? | Measured differences and clear examples |
| Derila Ergo review | Would the shape and feel suit me? | Verified dimensions, care label, actual use if available, return conditions |
| Contoured versus adjustable pillows | What should I compare? | Specific models, dimensions, adjustment range, practical fit differences |
| Online-shopping checklist | What should I check before paying? | Clear examples of complete cost and return-policy comparisons |

Google recommends original, useful review content with evidence and meaningful comparisons. Technical SEO helps search engines understand pages, but does not guarantee traffic, rankings, or income. See [Google's review guidance](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews) and [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).

## Offer restrictions to retain

The [Matsato affiliate page](https://matsato-osuren.com/matsato-osuren/affiliates) and supplied Derila materials prohibit brand bidding and official-brand impersonation, including brand use in site-level headers/footers. Keep ShoppeCove's own branding. Product coverage inside clearly labeled articles is separate from the site's identity. Read all applicable program terms before running ads.

[EPC Workshop's catalog and affiliate terms](https://epcworkshop.com/cb/new/home.html) cover several unrelated products and include specific review-labeling and creative-use requirements. No EPC offer has been selected or promoted in this implementation.
