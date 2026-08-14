# LuxRide Phase 2 Requirement Matrix

Generated: 2026-08-14

## Audit Context

- Local checkout: `C:\Users\h0676\Documents\my_projects\luxdure`
- Git branch: `main`
- Latest workbook found: `LuxRide-Price-List.xlsx`
- Workbook SHA-256: `fc8f0a907688dc140280f3a763dd0e04e705c3b96705169fed2745be5cb80fb1`
- Workbook dry run: `CLEAN`, 320 valid unique routes, 960 vehicle price records
- Existing production backup from earlier Phase 2 work: `/home/u163097036/backups/luxride-phase2-20260813-170202`
- Fresh 2026-08-14 production backup: `/home/u163097036/backups/luxride-phase2-continue-20260814-150534`
- WordPress timezone changed from `+00:00` to `Africa/Cairo`

## Matrix

| Area | Status | Evidence / Decision |
| --- | --- | --- |
| WordPress remains content source | IMPLEMENTED | Phase 1 CMS ownership is preserved for fleet, destinations, experiences, FAQ, and settings. |
| Dedicated booking/pricing plugin | LIVE VERIFIED | Plugin `luxride-booking-engine` is active at version `0.2.0`; schema version `0.2.0`. |
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
| Booking server recalculation | PENDING | Quote foundation is ready; final booking submission/storage flow still needs live integration validation. |
| Booking storage | SCHEMA READY | Booking table exists, but public booking create endpoint is not yet completed. |
| Booking reference | SCHEMA READY | Booking reference field exists; generation remains for booking submit phase. |
| Review screen | PARTIAL | Existing React review remains client-side until booking submit integration. |
| Flight number for airport arrivals | PARTIAL | Server quote exposes required fields; booking submit validation still pending. |
| Permit fields | PARTIAL | Server quote exposes `passport_or_id`; booking submit validation still pending. |
| Return fields | LOCAL IMPLEMENTED | Server validates same-day overday and later-date overnight returns. |
| 3-hour rule | LIVE IMPLEMENTED | Quote engine uses `wp_timezone()` and `minimum_lead_hours`, default 3. |
| Free Child Seat | LIVE VERIFIED | Quote returns child seat price `0` and Arabic label `كرسي أطفال مجاني`; two live FAQ entries were updated. |
| Arabic terminology | PARTIAL | API errors include Arabic messages; final UI QA still pending. |
| WordPress admin pricing | LIVE IMPLEMENTED | Admin can filter routes, open/edit route prices/rules/enabled flags, and settings. |
| Import/export | LIVE VERIFIED | Live import history recorded the clean workbook apply. |
| Security | LOCAL IMPLEMENTED | Admin handlers require `manage_options` and nonces; SQL uses prepared/update/insert APIs. |
| Full workbook validation | LIVE VERIFIED | Strict parser clean; live DB comparison checked all workbook route/price values with mismatch count `0`. |
| Hero overlay/copy/CTA | PARTIAL | Source still needs final visual QA after build/deploy. |
| Desktop English QA | PENDING | Requires local or live browser QA after final build. |
| Desktop Arabic QA | PENDING | Requires local or live browser QA after final build. |
| Mobile English QA | PENDING | Requires local or live browser QA after final build. |
| Mobile Arabic QA | PENDING | Requires local or live browser QA after final build. |
| Production deployment | LIVE VERIFIED | Plugin and rebuilt theme assets deployed; public HTML references `index-W8bJuM7j.js` and `index-Co-jw4-A.css`. |
| Rollback available | IMPLEMENTED | Fresh backup path recorded above. |

## Remaining Work

1. Public booking create/storage endpoint remains the next phase after the quote engine.
2. Four-version browser QA should still be performed after booking-flow integration.
3. Discount rules remain pending until an approved discount source exists.
