# Philips Lighting India — V3 Redesign Concept (by Convo & Connects)

Independent concept. Not affiliated with, endorsed by, or sold by Philips or Signify. No live checkout; product data from public in.shop.lighting.philips.com listings.

Open `dist/Philips_Lighting_V3_Experience.html` in any modern browser (single offline file; current product and editorial photos load from the Philips CDN when online, with drawn fallbacks offline).

## What's in it
- WebGL hero (domain-warped shader field, ribbon meshes, pendants, motes) + animated SVG wave dividers, page-wipe transitions, cursor glow and 3D tilt cards.
- All 19 product categories, shop with filters/sort/grid-list, PDP (variants, delivery, spec), search, bag, wishlist, account, quick view.
- Signify section (brand, 345-hub scale, Contact details), spaces, inspiration/blog, stores & pincode, contact, policies, social (Instagram, Facebook, X real; YouTube/WhatsApp marked "proposed"), newsletter, footer.
- **Light Studio**: photometric room simulator (see below).

## Light Studio — what "calibrated" means here
- Planckian-locus CCT to linear sRGB; luminous-intensity distributions in cd/lm (Lambertian, cos^n, omni, or uploaded IES LM-63).
- Direct illuminance E = I(θ)·cosφ / d²; indirect via integrating-sphere inter-reflection; maintenance factor; U0 on a task grid (0.5 m border excluded); room index.
- Fixed physical exposure (a 200 lx white diffuser = display white), false-colour lux map, virtual lux meter, plan view, polar plot.
- Unit-tested engine (`npm test` → test/photometry.test.mjs, 21 checks).
- **Honesty:** official listings do not publish lumens, CRI or Kelvin for most items. Those values are shown as **Assumed** chips and can be overridden with datasheet lumens or an IES file. Direct light is unshadowed; no ray-traced global illumination. It is a design aid, not a compliance report.

## Build
`npm install && npm run build` → `dist/Philips_Lighting_V3_Experience.html`

Run the photometry checks with `npm test`.

The redesign is intentionally a pitch concept: bag, account, forms and newsletter interactions are demo-only, while product, policy, support, social and campaign links point to the official Philips Lighting India / Signify destinations.
