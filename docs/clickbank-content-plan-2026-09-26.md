# New ClickBank offers and published articles

Checked September 26, 2026 for ShoppeCove, targeting US readers through organic Google search. This is an internal editorial plan, not a consumer article. The recommendations are an assessment of fit and observed marketplace signals, not a revenue guarantee or an exhaustive ranking of ClickBank.

## Publication status

All four selected articles were published on September 26, 2026 after the owner supplied or authorized generation of their ClickBank HopLinks:

- [Brain Training for Dogs](https://blogs.shoppercove.com/posts/brain-training-for-dogs-review)
- [Ultimate Small Shop](https://blogs.shoppercove.com/posts/small-woodworking-shop-setup)
- [Pianoforall](https://blogs.shoppercove.com/posts/pianoforall-adult-beginners-guide)
- [4 Foot Farm Blueprint](https://blogs.shoppercove.com/posts/4-foot-farm-blueprint-guide)

Public checks confirmed HTTP 200, canonical URLs, indexable metadata, three correctly attributed HopLink buttons per article with sponsored/nofollow attributes, affiliate disclosures, and inclusion in the homepage, archive and posts sitemap. This verifies publication and link configuration, not Google indexing, sales or commission payments. Research for the two additional selections is in [the expanded report](clickbank-expanded-research-2026-09-26.md).

## Selected NEW offers, in order of priority

| Priority | Offer / vendor | Why selected | Live marketplace EPC | Avg. commission per conversion | CVR | Gravity | Marketplace rank |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Brain Training for Dogs / BRAINYDOGS | A possible new pet-owner topic, with a concrete curriculum to evaluate; test only if expanding into pets | $0.13 | $42.23 | 0.30% | 13.9 | 196 |
| 2 | Ultimate Small Shop / USMALLSHOP | Narrow home-workshop planning topic; useful original guide possible, but weak observed EPC makes this a small test | $0.05 | $33.35 | 0.29% | 6.8 | 328 |

These values were read directly from the public [ClickBank Marketplace](https://accounts.clickbank.com/marketplace.htm), including the Home & Garden category and searches for Matsato and plant based. No login was required for those observations. The displayed tooltips define EPC and CVR over 30 days, average commission per conversion over 90 days, and Gravity using unique selling affiliates over 90 days. Rank combines several performance measures. They are aggregate figures, not US-organic-search results or evidence of product quality. Do not multiply figures with different reporting windows to manufacture a forecast. A displayed zero may reflect rounding or insufficient activity; it does not prove no product can sell.

Matsato Osuren and the Complete Plant-Based Cookbook already have published coverage. They are excluded from this batch at the owner's request. No replacement reviews or additional supporting articles for those two offers are included. These new offers expand the subject matter, so start with one, assess search queries and reader engagement, and avoid publishing a large number of unrelated product reviews at once.

## Blogs supplied

| Article file | Search intent | Matching offer | Link state |
| --- | --- | --- | --- |
| [Brain Training for Dogs review](articles/brain-training-for-dogs-review.md) | Decide whether an organized course suits the buyer better than free resources or individual help | Brain Training for Dogs | Owner-provided HopLink saved and published |
| [Small woodworking shop setup](articles/small-woodworking-shop-setup.md) | Plan space and spending, then decide whether a planning guide is useful | Ultimate Small Shop | HopLink generated in the owner's ClickBank account and published |

Both have original decision frameworks, clear research limitations, source references, SEO title/description, category assignment and intentional CTA placement. These keyword choices are based on relevance and search intent; no paid keyword-volume or difficulty data was available. No product was purchased or tested, no review stars were invented, and seller results were not adopted as our own.

## Affiliate pages and material checks

- [Brain Training for Dogs affiliate page](https://www.braintraining4dogs.com/affiliates/): promotion resources and restrictions reviewed. [Detailed research](research/brain-training-for-dogs.md) records the seller's observed $67 offer and 60-day guarantee, independent training guidance and unverified details. No claim that the course cures behavior problems or raises intelligence.
- [Ultimate Small Shop affiliate page](https://ultimatesmallshop.com/affiliates/): resources and FAQ reviewed. [Detailed research](research/ultimate-small-shop.md) records conflicting sales/affiliate prices and the absence of hands-on testing. Original planning guidance was used instead of reproducing the paid guide or promising a complete workshop at a fixed cost.

The tracked links are saved in `src/content/researched-posts.ts` and each article's **Product guide & affiliate link → Tracked affiliate URL**. Destination checks matched all four products; Pianoforall's checkout also displayed the matching encrypted affiliate identifier. Ultimate Small Shop was found by searching for seller `usmallshop` in the logged-in marketplace. Affiliate recruitment URLs and marketplace placeholder links remain research sources, not purchase buttons.

## Other offers screened

| Offer | EPC | Avg. commission | CVR | Gravity | Decision |
| --- | --- | --- | --- | --- | --- |
| TedsWoodworking | $0.15 | $59.23 | 0.26% | 86.2 | Stronger marketplace activity than some candidates, but a large plan-library review needs a sample/content-quality inspection; defer rather than endorse quantity claims |
| My Shed Plans | $0.04 | $32.83 | 0.11% | 21.5 | Low observed EPC and project-specific suitability questions; not an initial ShoppeCove priority |
| Declutter Fast | $0.00 | $10.88 | 0.00% | 0.1 | Existing draft preserved; current displayed activity does not justify prioritizing monetization over established kitchen topics |

Screening is not a full product audit. These three were not selected for new promotional articles, and their full affiliate terms were not re-reviewed in this pass. Health supplements, lottery and manifestation offers were outside the site's editorial focus even when commissions were higher.

## SEO and conversion implementation

The existing Next.js/Payload site already supplies canonical URLs, social metadata, BlogPosting and breadcrumb JSON-LD, draft noindex, published-only sitemaps, article contents and disclosed sponsored/nofollow purchase links. The new content uses that system without changing the public UI or existing articles.

Keep product review pages focused on the named offer and practical guides focused on the buying question. Avoid creating multiple near-identical reviews for keyword variations. Match the headline, opening answer and CTA to the actual reader decision. These two articles have no forced links to unrelated kitchen offers. Add related-post connections when relevant pet or workshop articles exist.

Add original testing, measurements and photographs when available; keep the research basis accurate until then. This follows [Google's review guidance](https://developers.google.com/search/docs/specialty/ecommerce/write-high-quality-reviews) and [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content). Neither word count nor technical metadata guarantees ranking.

The biggest remaining measurement gap is that the UI exposes affiliate placement attributes but does not currently record outbound clicks through an analytics service. Before deciding which offer earns best for this site, collect article visits, outbound clicks by article/placement, attributed sales and net commission after refunds. Use owner-generated tracking IDs to distinguish articles when updating HopLinks; preserve account attribution. Review Search Console impressions and queries to improve articles that are actually being found. A small number of clicks without sales is not enough evidence to label an offer a failure.

## CMS workflow

`node --import tsx scripts/create-researched-posts.ts` validates and previews the articles offline. `node --import tsx scripts/create-researched-posts.ts --apply` creates only missing CMS drafts. Existing slugs are preserved, with no updates to published articles and no publish option. The adapter is `src/content/researched-posts.ts`.

`scripts/update-researched-hoplinks.ts --apply` adds the configured links to existing unpublished drafts only, with backups and checks that other content is preserved. It intentionally refuses already-published posts.

`scripts/publish-researched-posts.ts --apply` publishes the four reviewed CMS IDs through Payload's existing `schedulePublish` task on a unique queue. It uses the configured production job credential, disables unrelated scheduling, and runs production hooks to refresh listings and the sitemap. Without `--apply`, these scripts only preview their work offline. After an interrupted publication, inspect the recorded queue and CMS state before retrying. No credentials or local backups are committed.

Unrelated published posts, drafts, Derila restrictions and decluttering work were preserved. No ads were purchased and no vendors were contacted.

## Saved CMS records

The initial drafts were created and read back on September 26, 2026. Their titles, body text and status matched the prepared content. HopLinks were added afterward, then the owner authorized publication of all four selected articles. Before/after comparisons confirmed their content and unrelated public documents were preserved.

- [Brain Training for Dogs in Payload](https://blogs.shoppercove.com/admin/collections/posts/6ab74ff552a2b9ec8e2b709b)
- [Small woodworking shop setup in Payload](https://blogs.shoppercove.com/admin/collections/posts/6ab74ff452a2b9ec8e2b7067)
- [Pianoforall in Payload](https://blogs.shoppercove.com/admin/collections/posts/6ab755e5d981daf8dddeebec)
- [4 Foot Farm Blueprint in Payload](https://blogs.shoppercove.com/admin/collections/posts/6ab755e5d981daf8dddeec1d)

TypeScript and scoped ESLint passed. The Markdown was converted and checked with the Payload rich-text renderer; publication was additionally verified against the public site.
