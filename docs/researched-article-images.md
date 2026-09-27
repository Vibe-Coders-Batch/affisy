# New affiliate article cover images

Created September 28, 2026 with the built-in image generation tool. These are generic editorial illustrations, not merchant assets, screenshots of paid courses, or evidence of product testing. They follow the site's warm neutral and sage visual style.

## Workspace assets

- `public/images/brain-training-for-dogs-editorial.webp`: 1896 × 830; 170,224 bytes.
- `public/images/small-woodworking-shop-editorial.webp`: 1536 × 1024; 158,750 bytes.
- `public/images/pianoforall-practice-editorial.webp`: 1536 × 1024; 178,346 bytes.
- `public/images/4-foot-farm-garden-editorial.webp`: 1536 × 1024; 275,124 bytes.

The final images are stored in the repository and uploaded through Payload to the configured media storage. Each post uses its cover for the article hero, listing card and social metadata, with descriptive alt text and a visible AI illustration disclosure. WebP exports use quality 82 and retain the generated composition; originals remain in the local image generation output directory. The four files total 782,444 bytes, before the site's responsive image optimization.

## CMS update

`node --import tsx scripts/add-researched-images.ts` previews the work offline. Add `--apply` to upload the four covers and update only their matching published posts. The script backs up current state, refuses pending drafts or changed content, preserves article text and affiliate links, and refreshes production caches through the existing CMS publishing jobs. After an interrupted run, inspect its backup and recorded job queue before retrying.

## Verification

All four covers were applied to the live articles. Anonymous HTTP checks confirmed article hero images and alt text, visible illustration captions, matching Open Graph/Twitter images, BlogPosting image data, three unchanged HopLink buttons per article, and image cards on the homepage and archive. Original files, social derivatives and rendered hero URLs returned HTTP 200 with image content types. Desktop card crops, the workshop hero and the mobile dog-cover layout were visually checked. Production publishing jobs refreshed all four pages, and CMS snapshots confirmed unrelated posts and existing article content were preserved. Full TypeScript and scoped ESLint checks passed.

## Prompts

### dog

Use case: photorealistic-natural. Create one landscape 1536x1024 editorial cover illustration for a thoughtful home-and-lifestyle blog article about choosing an at-home dog training course. A relaxed medium-sized brown-and-white adult dog sitting naturally beside a simple neutral-colored treat puzzle on a sage green woven mat in a bright comfortable living room. The dog is the clear focal point, alert but relaxed, with believable anatomy and fur. Warm ivory walls, light oak floor, soft natural window light, calm refined editorial lifestyle photography aesthetic with tactile real materials. Medium-wide framing, keep the dog including face and the puzzle within the central 70% so a centered wide 16:7 crop works; no essential details at top or bottom edges. Uncluttered setting, restrained warm neutral and sage palette. No people, no text, no logos, no product packaging, no training certificates, no arrows, no split-screen, no collage. This is a generic AI editorial illustration, not a product photograph or evidence of training results.

### workshop

Use case: photorealistic-natural. Create one landscape 1536x1024 editorial cover illustration for a thoughtful home blog article about planning a small woodworking workshop before buying tools. A compact, orderly home workshop corner centered on a light-oak workbench, with a few generic hand tools neatly on a simple pegboard, a closed tape measure, carpenter's square, pencil and two short pieces of smooth wood lying safely flat on the bench. A simple clamp attached correctly to the bench edge. Soft natural side-window light, warm ivory walls and muted sage storage accents, realistic wood grain, calm refined editorial interiors photography. Medium-wide composition with main bench and tools concentrated in the central 70%, designed to crop well into a wide 16:7 hero and small card. Modest achievable space, no luxury industrial machinery, no people or hands, no powered tools operating, no dust clouds, no text, no logos, no packaging, no collage. This is a generic AI editorial illustration, not a workshop built using any named guide and not evidence of product testing.

### piano

Use case: photorealistic-natural. Create one landscape 1536x1024 editorial cover illustration for an adult-beginner piano-learning blog guide. A generic compact digital piano on a simple sturdy stand in a quiet light-filled home corner, bench tucked nearby, an open blank practice notebook and pencil on a small adjacent oak side table, and a modest leafy houseplant. Three-quarter view along the keyboard, realistic piano-key geometry with black keys in repeating groups of two and three. Warm ivory wall, light oak, muted sage fabric accents, soft natural window light, refined candid editorial interiors photography with realistic textures. Keep the keyboard and main arrangement inside the central 70% for a wide 16:7 crop; the piano keys should remain clearly recognizable in cards. Welcoming adult practice space, clean and uncluttered. No people or hands, no screen interfaces, no sheet-music text, no lettering, no brands or logos, no course packaging, no collage. This is a generic AI editorial illustration, not a photograph of the Pianoforall course or a product test.

### garden

Use case: photorealistic-natural. Create one landscape 1536x1024 editorial cover illustration for a home-and-kitchen blog guide about planning a small edible patio garden. A modest sunny patio corner with three terracotta containers and one small plain wooden raised planter, growing healthy realistic leafy lettuce, basil and a compact tomato plant with a few ordinary tomatoes. A small generic watering can placed alongside. Natural restrained variety, believable plant structure and growing scale, no huge harvest. Warm ivory exterior wall, soft oak tones, lively natural greens, gentle morning daylight, refined editorial garden photography aesthetic with tactile soil and terracotta. Main plants and containers grouped in central 70% so the image works cropped to wide 16:7 and small blog cards; uncluttered, calm, inviting. No people or hands, no labels, no text, no logos, no product packaging, no measuring graphics, no collage. This is a generic AI editorial illustration, not a diagram or depiction of paid 4 Foot Farm Blueprint plans, and not evidence of growing results.
