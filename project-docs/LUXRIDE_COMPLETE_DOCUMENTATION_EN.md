# LuxRide Complete Documentation

**Audience:** programmers, WordPress administrators, booking operators, and future maintainers.
**Languages:** English customer experience and Arabic customer experience with LTR/RTL switching.
**Production:** [https://luxride-eg.com](https://luxride-eg.com)

## 1. What the system is

LuxRide is a fixed-price private-transfer system. Customers browse curated public pages, choose a one-way or round-trip transfer, receive a server-generated quote, enter booking details, and receive a booking reference. WordPress stores the operational data and the React/Vite application provides the customer interface.

The source of truth is split deliberately:

- WordPress database: live routes, prices, settings, availability, promotions, bookings, and operations data.
- WordPress content: vehicles, destinations, experiences, FAQ content, and other editable bilingual content.
- React/Vite source: layout, interactions, translations, route presentation, booking flow, and the production bundle.
- Public curated cards: editorial selections for Home and Destinations, not a replacement for the calculator matrix.

## 2. Code map for programmers

```text
src/app/
  components/luxride/data.ts       frontend types, route mapping, quote display helpers
  components/luxride/cms.tsx       WordPress bootstrap and CMS normalization
  components/luxride/i18n.ts       shared translations and language helpers
  components/luxride/seo.ts        page metadata and SEO helpers
  pages/                           customer pages, booking flow, admin review pages
  App.tsx                          router and application shell
wordpress/wp-content/themes/luxride/
  theme PHP, index shell, assets, and the Vite mount point
wordpress/wp-content/plugins/luxride-booking-engine/
  includes/class-luxride-booking-rest.php
  includes/class-luxride-booking-pricing-engine.php
  includes/class-luxride-booking-bookings.php
  includes/class-luxride-booking-schema.php
  includes/class-luxride-booking-admin.php
  includes/class-luxride-booking-importer.php
  includes/class-luxride-booking-promotions.php
  includes/class-luxride-booking-availability.php
  includes/class-luxride-booking-locations.php
```

Do not duplicate pricing logic in the frontend. The frontend can display a preview, but the plugin recalculates the final quote before persisting a booking.

## 3. Local setup and checks

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
```

The production frontend build is:

```bash
npm run build -- --base=/wp-content/themes/luxride/
```

Run it from `C:\Users\h0676\Documents\my_projects\luxdure`. The result is `dist/`. The build is intentionally not part of ordinary source review; run it before a frontend deployment.

## 4. Customer routes and language behavior

Primary public routes include `/`, `/about`, `/fleet`, `/destinations`, `/experiences`, `/booking`, `/transfer-details`, `/booking-success`, `/faq`, `/contact`, `/cancellation-policy`, `/privacy-policy`, and `/terms`. Compatibility redirects include `/featured-transfers` and `/journeys`.

The language switch changes all customer copy, route labels, form labels, validation messages, date display, and direction. Arabic must set RTL at the application/document level and English must restore LTR. Always check both language modes after changing shared components.

Public Home and Destinations cards are curated editorial views. They must not be expanded to all 320 calculator routes. The expected public Destinations structure is 20 cards when the approved content is loaded; the Home Most Requested count is a separate curated count.

## 5. REST contract

Base URL: `/wp-json/luxride/v1`.

| Method | Path | Use |
| --- | --- | --- |
| GET | `/routes` | Enabled routes, bilingual labels, vehicle prices, fees, and applicable promotion data. |
| POST | `/quote` | Server-calculated quote, fees, availability, lead-time validation, and promotion. |
| POST | `/availability` | Vehicle blocks and booking conflicts for a requested period. |
| POST | `/bookings` | Validated booking creation and notification workflow. |
| GET | `/public-settings` | Safe public settings. Never add secret credentials here. |

Important server rules:

- Base prices, fees, promotions, minimum lead time, vehicle blocks, and capacity are server-side.
- The booking endpoint must not trust a total submitted by the browser.
- Idempotency prevents accidental duplicate submissions.
- If Turnstile is enabled, the endpoint rejects missing or invalid tokens after server-side verification.
- Public settings may contain the Turnstile Site Key and mode, but never the Secret Key.

## 6. Pricing and Routes administration

Open WordPress `LuxRide > Pricing & Routes`.

### Route data

Each route has a stable `route_code`, English and Arabic pickup/destination labels, trip names, recommended trip type, round-trip classification, fee flags, and enabled status. Each route has three vehicle price records: `sedan`, `mpv`, and `minivan`; each record has `one_way` and `round_trip` values.

Expected approved matrix:

- 320 routes
- 960 route/vehicle price records
- 1,920 one-way/round-trip values

### Template download and import

1. Open `LuxRide > Pricing & Routes`.
2. Under `Workbook Import`, click `Download import template (.xlsx)`.
3. Add or edit rows in the downloaded workbook while preserving stable route codes.
4. Keep Arabic text in the `pickup_ar` and `destination_ar` columns. Save the workbook as UTF-8-compatible content when using CSV.
5. Upload the `.xlsx`, `.csv`, or approved JSON payload.
6. Click `Dry run / validate` and fix every reported error.
7. Export a pricing backup.
8. Click `Apply clean import` only after the dry run and backup are confirmed.
9. Recheck route count and price-value count, then test representative quotes in EN and AR.

Template columns are:

```text
route_code, pickup, destination, pickup_ar, destination_ar,
trip_name_one_way, trip_name_return, trip_name_one_way_ar, trip_name_return_ar,
enabled, recommended_trip_type, round_trip_classification,
airport_fee_applicable, permit_required, accommodation_applicable,
accommodation_fee_eur, sedan_one_way_eur, sedan_round_trip_eur,
mpv_one_way_eur, mpv_round_trip_eur, minivan_one_way_eur,
minivan_round_trip_eur
```

The template contains only user-entry fields. The system-managed fields `source_row`, `source_checksum`, and `updated_at` are included in the pricing backup export, not in the blank template.

Never use a missing price, a guessed price, a changed route code, or an accidental zero to hide an import error. Keep a backup before applying a production workbook.

### Fees and trip types

The customer sees `One Way` and `Round Trip`. Internally, route rules use the approved `overday` or `overnight` classification. Airport surcharge, permit fee, accommodation fee, and vehicle-specific permit values are calculated by the server quote engine.

## 7. Promotions

Open `LuxRide > Promotions`. A promotion has a name, active state, discount type/value, date window, priority, scope, and selected routes. A public card may display a promotion only when it is active, applies to the selected route, has a positive discount, and produces a valid discounted amount lower than the base amount. Otherwise the card shows only the normal starting price; it must never show `0`, `€0`, `0%`, or an empty badge.

The backend keeps the base price and calculates the discount. Do not change the quote engine to fix a display-only issue without proving the backend is the source of the problem.

## 8. Fleet and availability

Use `Vehicles` to edit bilingual vehicle content, published visibility, booking availability, features, capacity, and display order. The approved vehicle keys are `sedan`, `mpv`, and `minivan`; customer-facing copy should use `MPV`, not the old `Family` label.

Use `LuxRide > Availability` to create a temporary block. Choose the vehicle, start datetime, end datetime, reason, notes, and whether the block affects availability. A block must make the vehicle unavailable for overlapping quote/booking times, including on the first booking step, not only after navigation.

Use `LuxRide > Pickup Order` to arrange pickup locations. Save the order after drag/drop and verify it in the booking dropdown in both languages.

## 9. Bookings and operations

Use `LuxRide > Bookings` to search and filter by reference, customer/route, status, payment, dates, and sort order. Open a booking to review the snapshot and final total, apply/remove an approved booking discount, update driver name, vehicle plate, and admin notes, update operational/payment status, review notification status, export bookings, or delete only an intentionally selected test booking.

Do not expose passport/ID data in reports or support messages. Before deleting a test record, confirm it is the test record and not a real booking.

Booking references use the `LRT-` prefix. Customer confirmation email and admin notification must use `MPV` for the MPV vehicle type.

## 10. Email and Turnstile

SMTP is configured in WordPress/server configuration. Keep the username/password private. Test mail delivery to an external mailbox before declaring notifications ready, then create one clearly marked test booking and remove only that test record.

Turnstile has one intended implementation for the custom booking flow: `public-settings` exposes only safe settings and the Site Key, React renders one widget and submits one token, and the booking endpoint performs server-side Siteverify validation. A generic WordPress Turnstile plugin must not create a second widget on the custom React form; it may remain for standard WordPress login/admin forms if useful.

## 11. Deployment

Frontend build:

```powershell
cd C:\Users\h0676\Documents\my_projects\luxdure
npm run build -- --base=/wp-content/themes/luxride/
```

Windows SSH/SCP binaries:

```powershell
$ssh = 'C:\Program Files\Git\usr\bin\ssh.exe'
$scp = 'C:\Program Files\Git\usr\bin\scp.exe'
$key = 'C:\Users\h0676\.ssh\id_ed25519'
$server = 'u163097036@82.25.96.192'
$port = 65002
```

Before any live change, create a timestamped backup of the theme and plugin. Upload only the required `dist/assets/*` files for a frontend change and the required PHP files for a plugin change. Remove old hashed frontend assets only after the new assets are safely uploaded and the backup exists. Purge relevant page/CDN caches, then hard-refresh the production domain.

Example frontend upload after a successful local build:

```powershell
& $scp -i $key -P $port (Get-ChildItem .\dist\assets -File | ForEach-Object FullName) "$server`:/home/u163097036/domains/luxride-eg.com/public_html/wp-content/themes/luxride/assets/"
```

PowerShell reserves `$Host`; use `$server`, not `$host`, for the SSH destination. Do not put passwords or secret keys in commands, commits, documentation, or screenshots.

## 12. QA checklist

Run the final customer flow in four combinations: Desktop EN, Desktop AR, Mobile EN, Mobile AR.

- Home and Destinations cards load with the curated counts and correct images.
- No inactive promotion shows a zero, badge, old price, or empty placeholder.
- Booking form loads with one-way/round-trip rules and correct date format.
- Pickup and destination labels switch correctly; Arabic is RTL.
- Vehicle labels use Sedan, MPV, and Mini Van consistently.
- Vehicle blocks are reflected immediately in availability and booking choices.
- Quote totals match server output, including airport, permit, accommodation, and promotion rules.
- Booking Detail supports discount apply/remove, driver/plate, and notes.
- Confirmation page/reference and customer/admin email contain the correct vehicle label.
- Missing and fake Turnstile tokens are rejected when protection is enabled.
- No console errors, duplicate Turnstile widgets, layout overflow, or stale frontend assets.
- A test booking is visible in WordPress, then deleted by its exact ID/reference only.

After imports or deployment, verify counts, representative route quotes, and the actual served production assets. A successful Git push or HTTP 200 alone does not prove that the live page is using the new release.

## 13. Troubleshooting

- **Old page after deployment:** inspect the HTML asset names, remove obsolete hashed assets only after backup, purge caches, and hard-refresh.
- **Arabic appears corrupted in Excel:** use the XLSX template or UTF-8 CSV; do not use a legacy ANSI export path.
- **Import button missing:** deploy the current plugin admin/importer PHP files and confirm the user has the required WordPress capability.
- **Menu missing:** confirm the custom plugin is active and inspect PHP syntax/server logs; do not install a duplicate plugin blindly.
- **Price differs from the card:** test `/quote`; the server quote is authoritative and promotions/fees may be context-dependent.
- **Vehicle selectable while blocked:** check the block active flag and exact start/end timezone, then test the availability endpoint for an overlapping datetime.
- **Email missing:** inspect SMTP configuration and booking notification status; never place SMTP credentials in the frontend.

## 14. Change discipline

Keep changes small, preserve approved visual assets and copy, and update the relevant guide when an admin path, API contract, import column, or operational rule changes. Before delivery, inspect `git status`, run `git diff --check`, review the staged file list, and verify the pushed commit in the owner repository.
