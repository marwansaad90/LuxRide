# LuxRide interactive frontend prototype

LuxRide is an existing React and Vite prototype for an Arabic/English private-transfer service in Hurghada and Egypt. It preserves the original React Router architecture and represents the intended booking, notification, and availability-management experience without a backend.

## Requirements

- Node.js 20 or newer
- npm (the repository uses `package-lock.json`)

## Local development

```bash
npm install
npm run dev
```

Vite prints the local URL after startup.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run the complete sequence with:

```bash
npm run check
```

## Production preview

```bash
npm run build
npm run preview
```

The production output is generated in `dist/` and is intentionally ignored by Git.

## Cloudflare Pages

This repository is ready to connect to Cloudflare Pages from GitHub.

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: 20 or newer

The included `wrangler.toml` declares `pages_build_output_dir = "./dist"` so Cloudflare Pages and Wrangler use the same production output folder.

## Routes

Customer routes:

- `/`
- `/about`
- `/fleet`
- `/destinations`
- `/transfer-details`
- `/booking`
- `/contact`
- `/faq`
- `/cancellation-policy`
- `/booking-success`
- `/booking-error`
- `/last-minute`

Prototype/reference routes:

- `/validation-states`
- `/availability-admin`
- `/whatsapp-preview`
- `/email-preview`

## Static deployment and browser refreshes

LuxRide uses `createBrowserRouter`, so the production host must rewrite every unknown frontend path to `/index.html`. The included `public/_redirects` supports hosts that implement the Netlify-style redirects format. For other hosts, configure the equivalent SPA fallback:

- Nginx: `try_files $uri $uri/ /index.html;`
- Apache: rewrite non-file and non-directory requests to `index.html`
- Vercel/Cloudflare Pages: configure a catch-all rewrite to `/index.html`
- GitHub Pages: add a platform-specific SPA fallback or deploy behind a host that supports rewrites

Do not change to hash routing unless the selected host cannot provide an SPA fallback.

## Client-owned placeholders

See [CLIENT_INPUT_REQUIRED.md](./CLIENT_INPUT_REQUIRED.md). Missing production contact data, route rules, final images, exact font confirmation, and Tripadvisor content are not invented in this prototype.

## WordPress phase

This repository does not implement WordPress, a database, real admin persistence, real WhatsApp/email delivery, Tripadvisor scripts, availability locking, vehicle blocking, route/discount management, SSL, hosting, backups, security plugins, or SEO schema. The relevant screens are visual and behavioral prototypes only.
