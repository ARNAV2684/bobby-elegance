# Image attribution

All photography in this directory is **placeholder stock imagery** from
[Unsplash](https://unsplash.com), used under the
[Unsplash License](https://unsplash.com/license) — free for commercial use,
no attribution required. Attribution is recorded here anyway as good practice
and so every file's origin is traceable.

## These images are temporary

They are stand-ins until Bobby Elegance's own product photography arrives.
They show ethnic wear that is broadly representative, but they are **not the
client's products** and the garments shown do not correspond to the SKUs,
fabrics, or colourways described in the catalogue data.

## Replacing them with the real photoshoot

Nothing in `components/` references an image path directly. Every URL comes
from the catalogue seed data, so the swap is a data change:

1. Drop the new photos into `public/images/products/` using the same
   `product-N.jpg` naming, **or** give them real names and update the paths.
2. Product image paths are generated in
   `packages/db/src/seed/catalog.ts` — see `poolPath()` and `buildImages()`.
   Point them at the new files.
3. Update each image's `alt` text in `buildImages()` — it is currently
   generated from the product title and fabric, which is a reasonable default
   but a real photo deserves a real description.
4. Set `credit: null` (already the default) and delete this file.

Recommended export settings for the real photography:

| Use | Aspect | Size | Notes |
| --- | --- | --- | --- |
| Product | 2:3 portrait | 1600×2400 | Two per product: front, then the alternate colourway |
| Hero | 16:9 landscape | 2400×1350 | Subject weighted right — copy sits on the left |
| Collection tile | 4:5 portrait | 1200×1500 | |
| Founder | 3:4 portrait | 1200×1600 | |

Export as JPEG quality 80. Next.js converts to AVIF/WebP and resizes at
request time, so there is no need to pre-generate variants.

## Source index

See `manifest.json` in this directory for the exact Unsplash photo ID behind
every downloaded file.
