# LuxRide Phase 2 Calculator Architecture

Generated: 2026-08-15

## Source Of Truth

1. Latest explicit client messages.
2. Latest approved workbook values.
3. Current approved WordPress/React production behavior.
4. Project docs and older plans.

The Phase 2 plugin does not replace Phase 1 content ownership. WordPress CMS remains authoritative for fleet, destinations, experiences, FAQ, and settings.

## Plugin

Plugin path:

`wordpress/wp-content/plugins/luxride-booking-engine/`

The plugin owns:

- route tables,
- route vehicle prices,
- server-side quote calculation,
- capacity validation,
- time validation,
- booking records,
- Pricing & Routes admin entry.
- Bookings admin entry.

The production calculator uses WordPress REST routes and quotes when available, with the compiled workbook as a local/static fallback.

## Database Schema

`wp_luxride_routes`

- stable `route_code`,
- pickup/destination keys and bilingual labels,
- `recommended_trip_type`,
- `round_trip_classification`,
- airport/permit/accommodation flags,
- enabled/display/source metadata.

`wp_luxride_route_prices`

- one row per route and vehicle key,
- `one_way_price_eur`,
- `round_trip_price_eur`,
- unique route + vehicle key.

`wp_luxride_bookings`

- human-readable booking reference,
- idempotency key,
- route/customer/conditional/price snapshots,
- server-calculated final total,
- status and notification fields.

## Vehicle Keys

Pricing keys are independent from visual vehicle order:

- `sedan` -> Toyota Corolla, 3 passengers, 2 bags
- `mpv` -> Mitsubishi Xpander 2027, 4 passengers, 4 bags
- `minivan` -> Toyota HiAce, 8 passengers, 8 bags

## Fee Rules

- Currency: EUR.
- Taxes: included.
- Airport fee: EUR 2 once per applicable booking.
- Permit fee: Sedan EUR 20, MPV EUR 20, Minivan EUR 30.
- Accommodation fee: EUR 42/night by default, only for Overnight Round Trip; nights are calculated from outbound and return calendar dates, minimum 1.
- Discount: architecture returns zero until configured rules are added.

## Trip Model

Customers select only:

- `one_way`
- `round_trip`

The engine maps round trips to a system classification:

- `overday`
- `overnight`

All imported routes should support both customer trip types. `recommended_trip_type` is stored separately for prefilling and UX hints.

## REST Endpoints

`GET /wp-json/luxride/v1/routes`

- Returns enabled routes and their vehicle prices from plugin tables.
- Optional `pickup` query narrows destination choices.

`POST /wp-json/luxride/v1/quote`

Input concept:

```json
{
  "pickup": "Hurghada Airport",
  "destination": "El Gouna",
  "trip_type": "one_way",
  "vehicle": "mpv",
  "passengers": 2,
  "bags": 2,
  "outbound_datetime": "2026-08-14 10:00"
}
```

Output includes route, vehicle, classification, fee breakdown, total, required fields, and validation state.

`POST /wp-json/luxride/v1/bookings`

- Recalculates the quote server-side immediately before insert.
- Ignores client-provided `total`.
- Compares explicit `review_total` against the recalculated quote and returns `price_changed` when it differs.
- Returns `last_minute_required` for normal booking attempts inside the minimum lead window.
- Stores snapshots in `wp_luxride_bookings`.
- Returns a customer-facing reference like `LRT-YYYYMMDD-XXXX`.
- Fires `do_action('luxride_booking_created', $booking_id, $booking)` for Phase 3 notifications.

## Import Workflow

Read-only workbook parser:

```powershell
$env:PYTHONIOENCODING='utf-8'
& 'C:\Users\h0676\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\luxride_workbook_import.py --workbook LuxRide-Price-List.xlsx --strict --json-out build\luxride-workbook-import.json
```

Current dry run is clean:

- 320 valid rows,
- 320 unique route pairs,
- 960 vehicle price records,
- 0 malformed rows,
- 0 duplicate route pairs,
- 0 duplicate conflicts.

The admin import screen consumes the generated JSON payload. Use dry-run/validate before apply.

## Time Logic

The quote engine uses `wp_timezone()` and enforces a 3-hour standard booking cutoff server-side. Production WordPress timezone was changed to `Africa/Cairo` during Phase 2, and booking references use the same timezone.

## Rollback

Phase 2.2 backup:

`/home/u163097036/backups/luxride-phase2-booking-20260814-211014`

It includes:

- active theme backup,
- database dump,
- plugin backup slot if an earlier plugin exists.

The plugin is live after fresh backup, server PHP lint, guarded import, and live quote checks.

Live verification:

- Active plugin version: `0.3.0`
- Schema version: `0.3.0`
- Live frontend bundle: `index-DiQc_HbZ.js` and `index-DZ32_PlR.css`
- Imported routes: 320
- Imported vehicle price records: 960
- Exact workbook/DB mismatch count: 0
- Public quote checks passed for Wadi Lahmy, Luxor permit, Alexandria overnight accommodation, free child seat, and capacity overflow.
- Public booking checks passed for server recalculation, tampered total protection, idempotency, `price_changed`, `last_minute_required`, airport departure flight validation, and permit missing-field validation.
- Normal-browser live QA passed for desktop English, desktop Arabic, mobile English, and mobile Arabic.
