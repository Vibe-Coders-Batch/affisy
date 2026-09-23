# Guide cover images

Generated with the built-in image generation tool on September 23, 2026. These are generic editorial illustrations, not product photographs or evidence of recipe testing.

## Assets

- `public/images/knife-or-set-editorial.webp`: 1536 × 1024, 155,180 bytes. Used on “One chef’s knife or a knife set”.
- `public/images/three-plant-based-dinners-editorial.webp`: 1536 × 1024, 381,886 bytes. Used on “Plan three plant-based dinners”.

Both are WebP exports at quality 82. Original PNGs remain in the local generated-images directory. The CMS stores alt text, uses the image in both hero and SEO/card fields, and displays an AI illustration disclosure below the hero.

## Prompts

### knife

Create a landscape 1536x1024 editorial still-life illustration for a thoughtful home-shopping blog article titled 'One chef’s knife or a knife set'. Soft natural window light, warm ivory worktop, sage green linen, light oak cutting board. One generic conventional chef’s kitchen knife lying safely flat on the board in the foreground, a small tidy wooden block holding a few other kitchen knives in the background, a whole lemon and a sprig of rosemary. Calm warm refined photographic realism, tactile materials, clean uncluttered composition. Keep important objects centered so it crops well into wide cards and a 16:7 hero. No people or hands. No logos, no brands, no finger-hole knife, no text or lettering, no advertising graphics. This is a generic illustrative kitchen scene, not a photograph of any product being reviewed.

### dinners

Create a landscape 1536x1024 editorial food illustration for a practical home-cooking blog titled 'Plan three plant-based dinners without buying a whole new pantry'. Overhead still life on a warm ivory kitchen surface with sage green linen: three distinct modest dinner dishes arranged naturally, a rice bowl with chickpeas bell peppers and spinach, a bowl of pasta with tomato sauce bell pepper and spinach, and a folded vegetable-and-chickpea wrap on a small plate. A few fresh bell peppers, tomatoes and spinach leaves nearby visually connect shared ingredients. Soft natural window light, appetizing realistic food texture, calm warm refined food-photography style, no exaggerated luxury or clutter. Keep all main dishes in the center for wide crops. No people, no text, no logos, no cookbook packaging. This is an illustrative meal-planning scene, not tested recipes from a specific cookbook.

## Reapplying in another environment

```sh
node --import tsx scripts/add-guide-images.ts
node --import tsx scripts/add-guide-images.ts --apply
```

The script backs up the published articles and navigation, uploads the images if absent, verifies their public URLs, and refuses to overwrite a pending article draft. It also corrects the existing Reviews link from the nonmatching plural query to `/search?q=review`. Follow a local-script update with a deployment to refresh cached pages. The globals cache key in this release changes to include query depth and load the corrected header.
