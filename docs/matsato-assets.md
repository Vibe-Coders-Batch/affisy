# Matsato supplier assets

Selected from the public [asset folder supplied by the site owner](https://drive.google.com/drive/folders/1P5lnDRsD9zKaMyXMv3xgbnpj5y3WsUaC) on September 19, 2026. These are supplier photographs/product imagery, not ShoppeCove testing evidence.

| Local web asset | Original supplier file | Placement |
| --- | --- | --- |
| `public/images/matsato-osuren-kitchen.webp` | [MATSATO3911.jpg](https://drive.google.com/file/d/15kauUh4JqSSa9VueKmdsX470QWfsKruN/view), Images / 26w07_Traditional-kitchen | Homepage hero, article hero/cards, social preview |
| `public/images/matsato-osuren-product.webp` | [Matsato On White.png](https://drive.google.com/file/d/1YZfanz-k1XErmelaX7y3nHpNh75icOaC/view), Assets | Article product overview |
| `public/images/matsato-osuren-grip.webp` | [MATSATO3505.jpg](https://drive.google.com/file/d/1Xt8xpQOyXaGzxz7piuDDZuuOLxZG_eZX/view), Images / 26w07_Traditional-kitchen | Article grip discussion |

Images were retrieved without sign-in or cookies. Original composition and product appearance are preserved. Web copies are auto-oriented, resized to 1920 pixels wide, converted to WebP at quality 84, and stripped of source metadata by Sharp. Individual files are approximately 131–255 KiB. Payload generates additional display sizes.

`scripts/use-matsato-assets.ts` previews changes by default; `--apply` uploads/upserts the media, backs up the CMS records locally, assigns the images and captions, and verifies article visibility, the exact affiliate link, and that Derila is unchanged and unpublished. Inline blocks have stable names to avoid duplication on repeat runs.

The original generic illustrations remain available for other editorial uses. The Matsato article and homepage use the supplied media through their CMS image fields.
