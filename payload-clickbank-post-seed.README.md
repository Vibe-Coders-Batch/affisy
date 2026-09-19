# Affisy-specific ClickBank seed

The GitHub project does not define an `offers` collection. It defines:

- `posts` with Lexical `content`, `meta`, `categories`, `relatedPosts`, `slug`, and `_status`
- `categories` with `title` and `slug`
- Payload 3 seed scripts using `getPayload`, `createLocalReq`, and `@payload-config`

`seed-clickbank-offers.ts` is adapted to that exact model. It creates the five requested categories and imports the 50 ranked ClickBank records as draft posts with:

- `title`: `Research candidate: ...`
- `slug`: `clickbank-...`
- `_status`: `draft`
- Lexical content containing the editorial angle, marketplace metrics, disclosure, verification checklist, source notes, and links
- The appropriate category relationship
- SEO `meta.title` and `meta.description`

## Installation in the Affisy repository

Copy these files into the repository root:

```text
payload_offers_seed.json
scripts/seed-clickbank-offers.ts
```

Add this script to `package.json`:

```json
"seed:clickbank": "cross-env NODE_OPTIONS=--no-deprecation tsx scripts/seed-clickbank-offers.ts"
```

Then run:

```bash
pnpm seed:clickbank
```

The importer is idempotent: it matches posts by slug, updates existing records, and creates missing records. It does not clear existing collections and does not publish the records.

## Important

The repository’s existing `seed:affiliate` flow clears and recreates demo data. Do not call that flow immediately before this importer unless you intentionally want to reset the database.

Before publishing any post, review the offer’s sales claims, affiliate terms, refunds, geographic availability, and any health or spirituality claims. Marketplace descriptions are included as unverified source notes for editorial review only.
