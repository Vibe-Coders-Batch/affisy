# Navigation fixes — September 23, 2026

## Observed problems

Live HTTP checks before this change showed the homepage responding in about 0.09–0.13 seconds, but `/posts` taking 6.70 seconds to first byte on the first request and 1.57 seconds on a repeat. The kitchen category also took about 1.57–1.58 seconds. These are a small diagnostic sample from one connection, not a general latency guarantee.

The journal/category routes awaited uncached Payload queries before returning their page. They fetched complete post records, including content not needed by cards. There was no `loading.tsx` boundary to prefetch a loading state for dynamic navigation. Homepage latest/featured queries also ran in sequence.

Search had a separate bug: its input always started empty, and a mount effect navigated to `/search`, discarding a `q` parameter supplied by navigation. The CMS Reviews link also used `reviews`, which did not match the singular word used in the review titles.

## Changes

- Share cached public card queries between the journal, categories, search and homepage. Pass category, page, limit, search query and featured ID as cache arguments, keeping results separate.
- Fetch only card fields, enforce public access and published status, and use a five-minute revalidation interval. Draft article preview queries are not cached here.
- Expire the public-card cache immediately when posts change or are deleted, and when populated media/categories change. Refresh home, journal and search paths.
- Add a route loading state and keyed Suspense boundaries for journal and search results, so the page responds while data loads. The placeholders respect reduced-motion preferences.
- Load homepage latest and featured lists concurrently.
- Initialize search from its incoming query, navigate only after editing/submission, encode query parameters, and use replace rather than filling browser history on each keystroke. Back/forward updates cancel pending searches without remounting the input.
- Correct the Reviews navigation target to `/search?q=review`.

The existing Payload application uses `unstable_cache`; this change follows that setup rather than enabling Cache Components throughout the CMS. Globals cache keys now include depth and a new version so this release picks up the updated header.

## Validation

Production build and TypeScript passed. ESLint passed on changed code. Eighteen focused tests passed across article rendering, SEO, public-listing safety/cache invalidation, and search navigation. Local browser checks confirmed all four article cards have loaded images and Reviews returns the two relevant posts without clearing the search field.

CMS command-line scripts using `disableRevalidate` bypass on-demand cache invalidation. For subsequent content changes, prefer publishing through the CMS web app. A deployment refreshes full-route output, but unchanged Data Cache entries can remain until their five-minute refresh or explicit tag invalidation.
