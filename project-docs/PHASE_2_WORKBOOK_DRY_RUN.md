# LuxRide Phase 2 Workbook Dry Run

Generated: 2026-08-15

## Workbook Identity

- File: `C:\Users\h0676\Documents\my_projects\luxdure\LuxRide-Price-List.xlsx`
- SHA-256: `fc8f0a907688dc140280f3a763dd0e04e705c3b96705169fed2745be5cb80fb1`
- Sheets: `LuxRide Price List`
- Parsed sheet: `LuxRide Price List`
- Header row: 3

## Header

| Column | Header |
| --- | --- |
| A | Pickup Location |
| B | Destination |
| C | نقطة الانطلاق |
| D | الوجهة |
| E | Sedan One Way (€) |
| F | Sedan Round Trip (€) |
| G | MPV One Way (€) |
| H | MPV Round Trip (€) |
| I | Mini Van One Way (€) |
| J | Mini Van Round Trip (€) |
| K | Trip Name (One Way) |
| L | Trip Name (Return) |
| M | اسم الرحلة - ذهاب |
| N | اسم الرحلة - عودة |

## Dry Run Summary

| Metric | Value |
| --- | ---: |
| Raw data rows | 320 |
| Valid rows | 320 |
| Malformed rows | 0 |
| Duplicate route pairs | 0 |
| Duplicate conflicts | 0 |
| Unique routes after first-duplicate policy | 320 |
| Vehicle price records after first-duplicate policy | 960 |
| Trip price values after first-duplicate policy | 1,920 |
| Overday round-trip classifications | 286 |
| Overnight round-trip classifications | 34 |

## Wadi Lahmy Verification

The approved workbook includes 18 `Wadi Lahmy` rows. Arabic destination/pickup label: `وادي لحمي`.

Covered pair group:

- Hurghada City Center, Al Ahyaa Subdivisions, El Gouna, Hurghada Airport, Makadi Bay, Safaga, Sahl Hasheesh, Soma Bay, Village Road -> Wadi Lahmy
- Wadi Lahmy -> Hurghada City Center, Al Ahyaa Subdivisions, El Gouna, Hurghada Airport, Makadi Bay, Safaga, Sahl Hasheesh, Soma Bay, Village Road

## Import Decision

Dry run status: `CLEAN`.

This workbook supersedes the 2026-08-13 blocked dry run. It has already passed guarded apply mode in production. For future imports, repeat the same guardrails:

- plugin PHP syntax is checked on the server PHP runtime,
- a fresh production backup is created,
- import apply validates against the generated JSON payload,
- live route/quote endpoint checks pass.
