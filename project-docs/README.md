# LuxRide Documentation

This folder contains the maintained handoff and operating documentation for LuxRide Taxi.

## Start here

| Audience | English | Arabic |
| --- | --- | --- |
| Programmers and administrators | [Complete guide](LUXRIDE_COMPLETE_DOCUMENTATION_EN.md) | [الدليل الكامل](LUXRIDE_COMPLETE_DOCUMENTATION_AR.md) |
| Pricing administrator | [Pricing admin guide](PRICING_ADMIN_GUIDE.md) | [تدريب الإدارة](LUXRIDE_ADMIN_TRAINING_AR.md) |
| Booking operations | [Phase 3 operations training](PHASE_3_BOOKING_OPERATIONS_TRAINING.md) | [تدريب الإدارة](LUXRIDE_ADMIN_TRAINING_AR.md) |
| Search and indexing | [SEO audit](SEO_AUDIT.md) | See the Arabic complete guide |

The complete guides are the preferred entry point because they explain the current architecture, bilingual customer/admin workflows, REST contract, pricing workbook, availability, promotions, booking operations, deployment, and QA. Older phase documents remain useful for historical decisions but should not override the current code or the complete guides.

## Important counts

- Calculator/live pricing routes: **320**
- Route/vehicle price records: **960**
- One-way and round-trip price values: **1,920**
- Public Destinations cards: **20** when the curated production set is loaded
- Home Most Requested cards: curated separately; verify the current public count during final visual QA

No secret keys, passwords, database credentials, or private keys belong in this folder.
