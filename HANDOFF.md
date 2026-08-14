# LuxRide Handoff

Last updated: 2026-08-14 18:15 +03:00  
Project path: `C:\Users\h0676\Documents\my_projects\luxdure`  
Current branch: `main`

## Project Summary

LuxRide is a React/Vite bilingual English/Arabic website prototype for private transfer booking in Hurghada and Egypt.

The project includes:

- Public marketing pages: Home, About, Fleet, Destinations, Experiences, FAQ, Contact.
- Booking flow with fixed route pricing from the workbook-derived route map.
- English/Arabic language toggle with RTL/LTR handling.
- Centralized business data, fleet data, routes, images, fees, and social links.
- Client-review mode where all three vehicles are selectable for testing.

## Current Git State

At the time of this handoff:

- Branch: `main`
- No tracked source changes were pending before creating this file.
- This handoff file itself is new and uncommitted.
- Several untracked local files/assets exist and should not be blindly committed without review.

Recent commits seen on `main`:

```text
de2667d **Hurghada Airpo**  mage
8fd1cd0 **Hurghada Airpo**  mage
1b3cc26 **Hurghada Airpo**  mage
423fc87 **Hurghada Airpo**  mage
301a6b2 **Hurghada Airpo**  mage
9e6d5a2 **Hurghada Airpo**  mage fix
e82589b **Hurghada Airpo**  mage fix
aa6ef48 **Hurghada Airpo**  mage fix
```

Untracked local items currently present:

```text
Screenshot 2026-08-03 162206.jpg
images/Hurghada.jpg
images/Marsa-Alam-Port-Ghalib.jpg
images/Sahl-Hasheesh.jpg
images/Screenshot-2026-08-08-124038.png
images/Screenshot-2026-08-08-125137.png
images/Screenshot-2026-08-08-125452.png
images/new_images/
images/لوكس-رايد.mp4
luxride icons.eps
luxride_icons_extracted_512_1024/
```

Do not stage those untracked items unless the next task explicitly needs them and their usage/license status is clear.

## Confirmed Client Requirements Already Reflected

### Social Links

Official social URLs are centralized in `src/app/components/luxride/data.ts`:

- Facebook: `https://www.facebook.com/luxride.eg/`
- Instagram: `https://www.instagram.com/luxride.eg/`

External social links should use:

```tsx
target="_blank"
rel="noopener noreferrer"
```

### Vehicle Testing State

Current review/testing behavior:

- `CLIENT_REVIEW_ENABLE_ALL_VEHICLES = true`
- `SELECTABLE_FLEET` order is `corolla`, `xpander`, `hiace`.
- All three vehicles are selectable for client testing.

Previously agreed production availability remains:

- Mitsubishi Xpander: Available
- Toyota Corolla: Coming Soon
- Toyota HiAce: Coming Soon

Do not permanently change production availability until the client explicitly confirms after testing.

### Fleet Order

The intended public display order is:

1. Toyota Corolla / Sedan
2. Mitsubishi Xpander 2027 / MPV
3. Toyota HiAce / Mini Van

This is controlled by `VEHICLE_SEGMENT_ORDER` and `SELECTABLE_FLEET` in `src/app/components/luxride/data.ts`.

### Experiences

Current `src/app/components/luxride/journeys.ts` contains:

- The Luxor day trip as the first featured journey.
- Wadi El Gemal with only one image.
- Luxor & Dendera with only one image.
- Porto Ghalib experience replacing the old airport arrival transfer.
- Sharm El Sheikh with only the first approved image.

### Destination Page Short-Transfer Badge Rule

In `src/app/pages/DestinationsPage.tsx`, route classification badges such as:

- `Round Trip · Same-day return`
- `ذهاب وعودة · عودة في نفس اليوم`

must not show inside:

- `Airport transfers`
- `Hurghada area transfers`

They may remain on longer city/long-distance transfers where appropriate.

### Airport Image Split

Client-approved distinction:

- Generic airport / airport destination imagery should use `images.jpg`.
- Specific `Hurghada City -> Hurghada Airport` transfer should use `Airport.jpg`.

The destination page currently imports:

```tsx
src/assets/destinations/airport-client.jpg
```

for the `Hurghada -> Hurghada Airport` destination card. Verify this file is actually committed before relying on it in production.

## Phase 2 Pricing Engine Status

Approved workbook now in use locally:

- File: `LuxRide-Price-List.xlsx`
- SHA-256: `fc8f0a907688dc140280f3a763dd0e04e705c3b96705169fed2745be5cb80fb1`
- Sheet: `LuxRide Price List`
- Clean dry run: 320 valid rows, 320 unique routes, 960 vehicle price records, 0 duplicates/conflicts
- Wadi Lahmy is included with 18 rows and Arabic label `وادي لحمي`

Local implementation completed:

- `scripts/luxride_workbook_import.py` detects the current workbook sheet/header and generates `build\luxride-workbook-import.json`.
- `wordpress/wp-content/plugins/luxride-booking-engine/` has schema/settings/admin/import/export/routes/quote code.
- React fallback route snapshot has been regenerated to 320 routes with exact Sedan/MPV/Minivan workbook prices. Do not reintroduce MPV ratio pricing.
- Vehicle card/tagline wording has intentionally removed the user-requested terms such as `MPV`, `مكيفة`, `تنفيذية`, and `رحبة` from fleet/card descriptions.

Production is updated:

- SSH must use `C:\Program Files\Git\usr\bin\ssh.exe`.
- Fresh backup: `/home/u163097036/backups/luxride-phase2-continue-20260814-150534`.
- Server PHP lint passed for all plugin files.
- Plugin `luxride-booking-engine` is active at version `0.2.0`; schema version is `0.2.0`.
- WordPress timezone changed from `+00:00` to `Africa/Cairo`.
- Live import applied 320 routes and 960 prices from SHA `fc8f0a907688dc140280f3a763dd0e04e705c3b96705169fed2745be5cb80fb1`.
- Exact workbook-to-DB validation mismatch count: 0.
- Live child-seat FAQ copy updated in English and Arabic.
- Public quote endpoint validated Wadi Lahmy airport fee, Luxor permit, Alexandria overnight accommodation, free child seat, and capacity overflow.
- Public homepage serves rebuilt assets `index-W8bJuM7j.js` and `index-Co-jw4-A.css`.

Phase 2 pricing engine is live verified. Booking submission/storage is the next phase.

## Important Known Issues To Check Next

### Footer Phone Direction

The footer phone link should stay directionally isolated in Arabic:

```tsx
dir="ltr"
style={{ unicodeBidi: "isolate" }}
```

Prefer wrapping the visible number with `<bdi>` and adding `whitespace-nowrap` if it regresses on mobile.

### Mobile Fleet RTL

The homepage fleet carousel should explicitly set direction by language:

```tsx
dir={lang === "AR" ? "rtl" : "ltr"}
```

Apply this both to the scroll container and each card if mobile Arabic ordering or alignment regresses.

### Browser QA Tool Note

The in-app browser automation failed during one run with:

```text
failed to write kernel assets: The system cannot find the path specified. (os error 3)
```

Fallback used successfully: local Chrome headless CDP with `--remote-debugging-port=9333`.

## Validation Last Performed

Most recent reported checks after the mobile/RTL pass:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Results:

- Lint passed.
- Typecheck passed.
- Tests passed: `29/29`.
- Build passed.
- Vite emitted the known large chunk warning only; this was not a build failure.

Known build warning:

```text
Some chunks are larger than 500 kB after minification.
```

## Recommended QA Matrix Before Any Final Client Delivery

Always check all four versions after visual/content changes:

- Desktop English
- Desktop Arabic
- Mobile English
- Mobile Arabic

Minimum pages to inspect:

- `/`
- `/fleet`
- `/destinations`
- `/experiences`
- `/booking`
- `/contact`

Key things to verify:

- Fleet order is Sedan -> MPV -> Mini Van.
- Arabic fleet descriptions are fully translated and not broken.
- Arabic direction is RTL, including mobile carousels.
- Footer and header phone number render as `+20 101 355 4009`.
- Destination page short transfer sections do not show route classification badges.
- Airport image mapping remains split correctly.
- No broken images.
- No public-facing internal language like test mode, review mode, placeholder, or pending approval.

## Local Development Commands

Install dependencies if needed:

```bash
npm install
```

Run dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5177
```

Run checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Combined check:

```bash
npm run check
```

## Git Commands For Next Operator

Review current state:

```bash
git status --short
git diff --name-only
git diff
```

Stage only intended source files:

```bash
git add HANDOFF.md
```

If also fixing the known tagline issue:

```bash
git add src/app/components/luxride/data.ts
```

Commit:

```bash
git commit -m "Add LuxRide project handoff"
```

Push to main only when ready for Cloudflare Pages sync:

```bash
git push origin main
```

## Deployment Notes

Cloudflare Pages is expected to deploy from GitHub `main`, but a successful push alone is not proof that Cloudflare is serving the newest build.

After pushing:

1. Wait for Cloudflare Pages deployment to finish.
2. Open the production URL with a cache-busting query string.
3. Confirm production HTML references the new built asset.
4. Verify the rendered page itself, not only HTTP 200.

Do not report "deployed" unless production rendering is actually verified.

## Client Input Still Required

See `CLIENT_INPUT_REQUIRED.md`.

Current unresolved items include:

- Production business email
- Confirmed business hours
- Route-specific driver accommodation rules
- Admission-fee policy
- Commercial-use confirmation for remaining client images where listed
- Final approved destination images
- Final Privacy Policy and Terms and Conditions
- Final production availability of Corolla and HiAce

## Safe Continuation Advice

The client has been asking for very narrow visual/content corrections. Continue using a narrow-diff approach:

- Do not redesign approved sections.
- Do not change pricing or booking logic unless explicitly asked.
- Do not commit unrelated untracked image folders.
- For every mobile-related correction, inspect desktop and mobile in both languages before reporting complete.
- Keep `main` as the deployment branch if the user asks for Cloudflare sync.
