# LuxRide client-review application

LuxRide is a bilingual English/Arabic React and Vite application for fixed-price private transfers from Hurghada across the Red Sea coast and Egypt. It includes the homepage calculator, three-step booking flow, route pricing, fleet selection, customer information pages, official Tripadvisor widgets, and direct review screens for future notification and availability workflows.

## Setup and development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The development server uses React Router and the same route structure as the production build.

## Verification and production build

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run check` runs lint, TypeScript, Vitest, and the Vite production build in sequence. Build output is written to `dist/`.

## Cloudflare Pages deployment

The repository is intentionally isolated at the LuxRide project root. Cloudflare Pages should use:

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- SPA fallback: `public/_redirects` publishes `/* /index.html 200`

`wrangler.toml` records the same `dist` output. No Content Security Policy is currently defined. If one is added later, Tripadvisor requires the minimum relevant allowances for `https://www.jscache.com`, `https://www.tripadvisor.com`, and `https://static.tacdn.com` in the appropriate script, image, connection, frame, style, and font directives.

## Vehicle availability configuration

`CLIENT_REVIEW_ENABLE_ALL_VEHICLES` in `src/app/components/luxride/data.ts` is the single client-review switch. It currently allows the calculator, booking flow, homepage fleet, and fleet page to select all three approved vehicles.

To restore the intended production state:

1. Set `CLIENT_REVIEW_ENABLE_ALL_VEHICLES` to `false`.
2. Keep `available: true` for Mitsubishi Xpander.
3. Keep `available: false` for Toyota Corolla and Toyota HiAce until the client confirms them.
4. Run `npm run check` before deployment.

The customer interface does not expose configuration-mode wording.

## Official Tripadvisor widgets

`Reviews.tsx` renders the exact official starter markup and mounts one asynchronous script after each container. `tripadvisor.ts` centralizes the immutable production identifiers and URLs:

- Your Rating: container `TA_cdsratingsonlynarrow470`, unique ID `470`
- Review Starter: container `TA_cdswritereviewnew935`, unique ID `935`
- Rave Reviews: container `TA_cdsscrollingravenarrow782`, unique ID `782`
- Location ID: `34457256`

Each script has a unique DOM ID, uses the official `www.jscache.com/wejs` URL, sets `data-loadtrk` before and after load, avoids duplicate insertion, and is cleaned up after a real route unmount. The external scripts are not loaded globally. Readiness must be verified on the deployed domain because official widget rendering depends on Tripadvisor's live services.

## Routes

Customer routes:

- `/`, `/about`, `/fleet`, `/destinations`, `/transfer-details`
- `/booking`, `/booking-success`, `/contact`, `/faq`
- `/cancellation-policy`, `/privacy-policy`, `/terms`

Direct review routes are intentionally excluded from normal customer navigation:

- `/availability-admin`
- `/validation-states`
- `/whatsapp-preview`
- `/email-preview`
- `/booking-error`

## Future production integration

A production backend, persistent availability management, operational WhatsApp/email delivery, payment processing, final legal approval, and final client-owned content remain outside this React client-review release. Confirmed missing client inputs are tracked in `CLIENT_INPUT_REQUIRED.md`; the application does not invent them.
