# LuxRide Phase 2 Requirement Matrix

Generated: 2026-08-15

## Audit Context

- Local checkout: `C:\Users\h0676\Documents\my_projects\luxdure`
- Git branch: `main`
- Latest workbook found: `LuxRide-Price-List.xlsx`
- Workbook SHA-256: `fc8f0a907688dc140280f3a763dd0e04e705c3b96705169fed2745be5cb80fb1`
- Workbook dry run: `CLEAN`, 320 valid unique routes, 960 vehicle price records
- Existing production backup from earlier Phase 2 work: `/home/u163097036/backups/luxride-phase2-20260813-170202`
- Fresh Phase 2.2 production backup: `/home/u163097036/backups/luxride-phase2-booking-20260814-211014`
- WordPress timezone changed from `+00:00` to `Africa/Cairo`
- Live frontend bundle: `index-DiQc_HbZ.js` and `index-DZ32_PlR.css`

## Matrix

| Area | Status | Evidence / Decision |
| --- | --- | --- |
| WordPress remains content source | IMPLEMENTED | Phase 1 CMS ownership is preserved for fleet, destinations, experiences, FAQ, and settings. |
| Dedicated booking/pricing plugin | LIVE VERIFIED | Plugin `luxride-booking-engine` is active at version `0.3.0`; schema version `0.3.0` adds booking idempotency support. |
| Route selection | LIVE VERIFIED | Public `GET /wp-json/luxride/v1/routes` returns enabled routes from pricing tables; React fallback snapshot regenerated to 320 routes. |
| Pricing source of truth | LIVE VERIFIED | Imported DB values exactly match the workbook for all routes and vehicle prices; mismatch count `0`. |
| One Way all routes | LIVE VERIFIED | 320 enabled routes support one-way quote pricing. |
| Round Trip all routes | LIVE VERIFIED | 320 enabled routes support round-trip quote pricing. |
| Overday/Overnight user selector hidden | IMPLEMENTED | UI exposes only One Way / Round Trip. |
| Overday/Overnight classification | LIVE VERIFIED | Imported workbook has 286 overday and 34 overnight classifications. |
| Supported vs recommended trip type | LIVE VERIFIED | `recommended_trip_type` imported independently from supported trip types. |
| Airport fee | LIVE VERIFIED | Public quote for Hurghada Airport -> Wadi Lahmy MPV one-way returns base EUR 78, airport EUR 2, total EUR 80. |
| Permit fee | LIVE VERIFIED | Public quote for Hurghada City Center -> Luxor Minivan round trip returns base EUR 236, permit EUR 30, total EUR 266. |
| Accommodation fee | LIVE VERIFIED | Public quote for Hurghada Airport -> Alexandria MPV overnight round trip returns base EUR 482, airport EUR 2, accommodation EUR 84 for 2 nights, total EUR 568. |
| Discounts | PENDING | Engine returns zero discount until an approved discount source exists. |
| Taxes included | LIVE VERIFIED | Engine returns taxes included flag from settings. |
| Vehicle stable keys | LIVE VERIFIED | Server keys `sedan`, `mpv`, `minivan`; aliases accept `corolla`, `xpander`, `hiace`. |
| Vehicle capacities | LIVE VERIFIED | Public capacity overflow test for Sedan returns HTTP 400. |
| Pickup/destination API | LIVE VERIFIED | Public route endpoint returned 26 Hurghada Airport routes and 1 Wadi Lahmy destination. |
| Quote API | LIVE VERIFIED | `/wp-json/luxride/v1/quote` passed Wadi Lahmy, Luxor, Alexandria, child-seat, and capacity checks. |
| Booking API | LIVE VERIFIED | Public `/wp-json/luxride/v1/bookings` created QA booking `LXR-20260815-TB6I` and returned idempotent replay for the same key. |
| Booking server recalculation | LIVE VERIFIED | Tampered client `total=1` was ignored; stored server total was EUR 80. |
| Booking storage | LIVE VERIFIED | Booking endpoint stored route/customer/conditional/price snapshots in `wp_luxride_bookings`; QA references `LXR-20260815-TB6I` and `LXR-20260815-LVDS` were visible before cleanup. |
| Booking reference | LIVE VERIFIED | Booking references are generated as `LXR-YYYYMMDD-XXXX`; live evidence: `LXR-20260815-TB6I`. |
| Review screen | LIVE VERIFIED | React review uses the latest successful server quote before enabling final submit; stale `review_total` returns `price_changed`. |
| Final submit | LIVE VERIFIED | Final booking submit persists through the server-authoritative bookings endpoint and returns a success reference. |
| Customer details | LIVE VERIFIED | Live booking storage included customer name, phone, passengers, bags, exact location, and conditional fields. |
| Flight number for airport arrivals | LIVE VERIFIED | Airport departure booking did not require an arrival flight number; airport-arrival routes still expose `flight_number` in required fields. |
| Permit fields | LIVE VERIFIED | Permit route without `passport_or_id` returned `luxride_booking_missing_fields` with `passport_or_id`. |
| Return fields | LIVE VERIFIED | Round-trip quote/booking validation keeps return date/time required where applicable and applies overday/overnight rules. |
| 3-hour Cairo-time rule | LIVE VERIFIED | Live booking attempt inside the cutoff returned `last_minute_required`; quote engine uses `wp_timezone()` and `minimum_lead_hours`, default 3. |
| Free Child Seat | LIVE VERIFIED | Quote returns child seat price `0` and Arabic label `كرسي أطفال مجاني`; two live FAQ entries were updated. |
| Loading/error states | LIVE VERIFIED | Booking/quote loading and error states include English and Arabic UI copy; live API errors verified `price_changed`, `last_minute_required`, and missing-field responses. |
| RTL | LIVE VERIFIED | Normal-browser live QA confirmed Arabic RTL direction on desktop and mobile. |
| WordPress admin pricing | LIVE VERIFIED | Live admin render supports search, pickup/destination filters, route edit, enabled state, recommended trip type, all sedan/MPV/minivan OW/RT price fields, and 21-column pricing export. |
| WordPress admin bookings | LIVE VERIFIED | Live LuxRide -> Bookings list/detail rendered reference, customer, route, trip date, vehicle, total, status, and safe status change/restore for QA booking `LXR-20260815-LVDS`. |
| Import/export | LIVE VERIFIED | CSV export emits one row per route with accommodation flags and all sedan/MPV/minivan one-way and round-trip price columns; direct export check returned 21 columns. |
| Security | IMPLEMENTED | Admin handlers require `manage_options` and nonces; SQL uses prepared/update/insert APIs. |
| Full workbook validation | LIVE VERIFIED | Strict parser clean; live DB comparison checked all workbook route/price values with mismatch count `0`. |
| Hero overlay/copy/CTA | LIVE VERIFIED | Normal-browser live QA confirmed hero support copy, CTA, darker overlay, and calculator card copy `Calculate Your Transfer`. |
| Desktop English QA | LIVE VERIFIED | Normal-browser screenshot: `qa-screenshots/phase2-booking-20260815/browser-normal/final-desktop-en.png`. |
| Desktop Arabic QA | LIVE VERIFIED | Normal-browser screenshot: `qa-screenshots/phase2-booking-20260815/browser-normal/final-desktop-ar.png`. |
| Mobile English QA | LIVE VERIFIED | Normal-browser screenshot: `qa-screenshots/phase2-booking-20260815/browser-normal/final-mobile-en.png`. |
| Mobile Arabic QA | LIVE VERIFIED | Normal-browser screenshot: `qa-screenshots/phase2-booking-20260815/browser-normal/final-mobile-ar.png`. |
| Production deployment | LIVE VERIFIED | Plugin and rebuilt theme assets are deployed; live HTML references `index-DiQc_HbZ.js` and `index-DZ32_PlR.css`. |
| Rollback available | LIVE VERIFIED | Fresh backup path recorded above. |

## Remaining Work

1. Discount rules remain pending until an approved discount source exists.
2. Final close-out must include commit, push, and clean worktree verification.
