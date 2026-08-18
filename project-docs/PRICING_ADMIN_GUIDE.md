# LuxRide Pricing Admin Guide

Generated: 2026-08-15

## Current Phase 2 Status

The live `luxride-booking-engine` plugin now includes the guarded Pricing & Routes admin workflow:

- fee/rule settings,
- route search and status filters,
- pickup and destination filters,
- route editor for prices, recommended trip, classifications, enabled state, and fee flags,
- JSON dry-run/apply import,
- import history,
- CSV pricing export.
- Bookings admin list/detail/status updates.

Production activation, import, and quote validation are complete.

Live state:

- Fresh backup: `/home/u163097036/backups/luxride-phase2-booking-20260814-211014`
- Active plugin version: `0.3.0`
- Active schema version: `0.3.0`
- Live frontend bundle: `index-DiQc_HbZ.js` and `index-DZ32_PlR.css`
- Imported routes: 320
- Imported vehicle price records: 960
- Exact workbook/DB mismatches: 0
- WordPress timezone: `Africa/Cairo`
- Public booking verification: `LXR-20260815-TB6I`, server total EUR 80 from tampered client total `1`, idempotent replay passed.
- Pricing export verification: 21-column route-level CSV with all three vehicle one-way and round-trip price columns.
- Final WordPress admin UI/status-change verification passed for QA booking `LXR-20260815-LVDS`; the two explicit Phase 2.2 QA bookings were removed afterward.

## Find Pricing & Routes

In WordPress admin, the plugin adds:

LuxRide -> Pricing & Routes

The screen reports:

- total routes,
- enabled routes,
- vehicle price records,
- booking count,
- schema version.

## Generate Import Payload

Run locally:

```powershell
$env:PYTHONIOENCODING='utf-8'
& 'C:\Users\h0676\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\luxride_workbook_import.py --workbook LuxRide-Price-List.xlsx --strict --json-out build\luxride-workbook-import.json
```

Expected approved result:

- `clean: true`
- `valid_rows: 320`
- `unique_routes_after_first_duplicate_policy: 320`
- `price_records_after_first_duplicate_policy: 960`
- `duplicate_conflicts: 0`

## Import Updated Price Data

1. Open LuxRide -> Pricing & Routes.
2. Upload `build\luxride-workbook-import.json`.
3. Click Dry run / validate.
4. Confirm the dry-run result is clean.
5. Upload the same JSON again and click Apply clean import.
6. Verify import history records the workbook SHA-256.

## Production Sync And Cache Purge

When production pricing, CMS content, theme assets, or booking plugin files are updated, use a backup-first sync and purge the WordPress/LiteSpeed cache through WordPress hooks. Do not delete arbitrary cache directories manually.

1. Create a fresh server backup of the database, active theme, and `luxride-booking-engine` plugin.
2. Import the approved workbook JSON and verify route count, vehicle price records, workbook SHA-256, and mismatch count before touching the cache.
3. Deploy only the current `dist/assets` files referenced by WordPress, plus the changed theme/plugin PHP files.
4. Keep at most one known-good previous `index-*.js` bundle for rollback and remove stale bundles that are no longer referenced.
5. Purge with `wp_cache_flush()`, `do_action('litespeed_purge_all', 'LuxRide production sync')`, and targeted `do_action('litespeed_purge_url', home_url('/path/'))` calls for `/`, `/booking/`, `/destinations/`, `/experiences/`, `/fleet/`, and `/cancellation-policy/`.
6. Verify normal production URLs without query-string cache busters. Confirm the HTML references the current JS/CSS bundle, the favicon link, and no old bundle.
7. Recheck `/wp-json/luxride/v1/content`, `/wp-json/luxride/v1/routes`, and quote samples after purge.

## Change Fees

Open LuxRide -> Pricing & Routes -> Fees & Rules.

Defaults:

- Airport surcharge: EUR 2
- Sedan permit fee: EUR 20
- MPV permit fee: EUR 20
- Minivan permit fee: EUR 30
- Driver accommodation: EUR 42/night
- Minimum lead time: 3 hours
- Taxes included: enabled

Free Child Seat remains EUR 0 by design.

## Disable Or Edit A Route

1. Search by pickup, destination, Arabic label, or route code.
2. Use the status filter if needed.
3. Click Edit.
4. Adjust vehicle prices, recommended trip type, round-trip class, fee flags, accommodation override, or enabled state.
5. Save route.

Supported customer trip types remain One Way and Round Trip even when the recommendation changes.

## Export Current Pricing

1. Open LuxRide -> Pricing & Routes.
2. Click Export pricing backup.
3. Store the CSV next to the deployment/import evidence.

The export is one route per row and includes route code, bilingual labels, enabled/recommended/classification fields, airport/permit/accommodation flags, accommodation override, sedan/MPV/minivan one-way and round-trip price columns, and workbook source metadata.

## Manage Bookings

Open LuxRide -> Bookings.

The screen lists the customer, route, trip classification, final server total, status, and created date. Open a booking to review stored route/customer/conditional/price snapshots.

Allowed booking statuses:

- `new`
- `confirmed`
- `cancelled`
- `completed`

Phase 2.2 live QA booking references used for verification were `LXR-20260815-TB6I` and `LXR-20260815-LVDS`; remove only those explicit QA rows during close-out if they are still present.
