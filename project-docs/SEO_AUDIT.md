# LuxRide SEO audit

## Completed in this batch

- Added unique customer-facing SEO titles and meta descriptions for the main public routes.
- Added route-aware canonical URLs. `/experiences` is canonical; `/featured-transfers` and `/journeys` redirect to it.
- Added Open Graph and Twitter card metadata with a stable approved LuxRide social image at `/luxride-og-image.webp`.
- Added JSON-LD for `LocalBusiness`, `Service`, `BreadcrumbList`, and `FAQPage` where supported by visible page content.
- Added `public/sitemap.xml` with public indexable routes only.
- Added `public/robots.txt` allowing the public site and disallowing internal review/admin/preview routes.
- Improved unknown-route handling with a customer-friendly 404 React page and `noindex,follow` metadata.
- Replaced several remote/random destination images with optimized local WebP assets generated from the latest client-supplied licensed-source image set.
- Preserved real Tripadvisor widgets and avoided adding fake review/rating schema.

## SEO issues found

- The React/Vite app previously had one mostly static title/description in `index.html`; important routes did not have unique metadata.
- `/featured-transfers` and `/journeys` created duplicate route concepts for the same section.
- No sitemap or robots file existed.
- No canonical, Open Graph, Twitter card, or structured-data layer existed.
- The app used a language toggle without distinct English/Arabic URLs, so valid `hreflang` alternates cannot be emitted yet.
- SPA metadata updates are client-side; crawlers that do not execute JavaScript may only see the default homepage metadata.
- The Vite bundle remains large enough to trigger the existing chunk-size warning, partly due to the current single-page prototype architecture and third-party Tripadvisor widgets.

## Current React SPA limitations

- Route-specific metadata is applied client-side after JavaScript loads.
- English and Arabic share the same URLs. Valid `hreflang` requires stable separate URLs, such as `/en/...` and `/ar/...`, or equivalent server-rendered language routes.
- Cloudflare Pages serves the SPA fallback with `index.html`; the React app renders the 404 state after load, but the static response is still handled by the SPA fallback.

## Production-domain steps

- Replace `https://luxdure.pages.dev` in `seo.ts`, `sitemap.xml`, and `robots.txt` when the final production domain is confirmed.
- Re-export/update the Open Graph image URL if the final domain changes.
- Confirm the final production email and business hours before adding them to richer business schema.

## WordPress-phase recommendations

- Create server-rendered destination and experience pages with unique copy for high-value routes.
- Add separate English and Arabic URLs and valid `hreflang` alternates.
- Generate canonical, Open Graph, Twitter, breadcrumb, FAQ, and service schema server-side.
- Keep Tripadvisor widgets isolated and do not create fake review schema from external widgets.
- Use the approved optimized image set as WordPress media assets with descriptive filenames, alt text, and responsive sizes.

## Client-owned data still needed

- Production business email if different from the current booking email.
- Confirmed business hours.
- Route-specific driver accommodation rules.
- Admission-fee policy.
- Final legal Privacy Policy and Terms and Conditions.
- Final production availability of Toyota Corolla and Toyota HiAce.
- Final production domain.
