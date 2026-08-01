Perform a COMPLETE CLIENT-REQUIREMENTS AUDIT, CORRECTION, IMPLEMENTATION, AND FINAL QA PASS on the EXISTING LuxRide interactive prototype.

THIS IS THE ONLY SOURCE-OF-TRUTH COMPLETION PROMPT.

Do not create a new project.
Do not create a duplicate homepage.
Do not redesign the project from scratch.
Do not remove correct existing work.
Do not remove working React Router routes.
Do not remove working booking logic.
Do not remove EN/AR bilingual support.
Do not begin WordPress implementation.
Do not invent business information that the client did not provide.
Do not claim that an item is complete unless you have checked it in the code and rendered interface.

Your job is to:

1. Review the entire existing project.
2. Compare it against every requirement in this prompt.
3. Fix everything missing, incorrect, incomplete, visually weak, or contradictory.
4. Preserve everything already implemented correctly.
5. Test the result on desktop, laptop, tablet, mobile, English LTR, and Arabic RTL.
6. Produce an honest final report.
7. Mark genuinely missing client data as NEEDS CLIENT INPUT.
8. Mark real backend and WordPress-only functions as WORDPRESS PHASE.
9. Do not stop after writing a report — first inspect, fix, and test the project.

==================================================
1. REQUIREMENT PRIORITY
==================================================

When two requirements conflict, use this priority:

1. The client’s latest written clarification.
2. The client’s latest design-review message.
3. The original LuxRide project-review document.
4. Existing implementation only when it does not conflict with the client.

Latest client requirements override older assumptions.

Critical latest rules:

- Use one final Send Booking Request button.
- Do not use separate WhatsApp and email submission buttons.
- The future implementation sends the same request to WhatsApp and email together.
- Do not display the physical total seating capacity of any vehicle.
- Do not display 7 passengers for Xpander.
- Do not display 15 passengers for HiAce.
- Xpander customer booking limit: 4 passengers and 4 bags.
- Corolla customer booking limit: 3 passengers and 2 bags.
- HiAce customer booking limit: 8 passengers and 8 bags.
- Only Mitsubishi Xpander is currently available.
- Corolla and HiAce remain Coming Soon.
- Use the uploaded official SVG logo.
- Use the client-provided vehicle images.
- Use the real LuxRide WordPress theme as the English typography and visual-rhythm reference:
  https://luxride.themepanthers.com
- Do not copy the reference theme’s demo branding, content, red color, login buttons, or structure.
- Preserve LuxRide’s green and orange identity.

==================================================
2. AUDIT THE FULL PROJECT FIRST
==================================================

Before editing:

- Inspect all source files.
- Inspect data.ts.
- Inspect all pricing data.
- Inspect all translations.
- Inspect all React Router routes.
- Inspect shared Header and Footer components.
- Inspect the homepage.
- Inspect the full booking flow.
- Inspect all vehicle cards and selectors.
- Inspect desktop and mobile rendering.
- Inspect English and Arabic rendering.
- Search the codebase for old logos.
- Search for old temporary vehicle images.
- Search for “7 passengers”.
- Search for “15 passengers”.
- Search for separate WhatsApp and Email final buttons.
- Search for duplicate calculators.
- Search for incorrect route prices.
- Search for placeholder text and Lorem Ipsum.
- Search for untranslated visible labels.
- Search for old Tripadvisor hero badges.
- Search for outdated About Us content.

For every major requirement use one of these statuses:

- PASS
- FIXED
- NEEDS CLIENT INPUT
- WORDPRESS PHASE

Do not use PASS without checking the actual implementation.

==================================================
3. OFFICIAL SVG LOGO
==================================================

Detect the newly uploaded official LuxRide SVG logo.

Replace every temporary, generated, text-based, PNG, or old LuxRide logo with the official SVG.

Use it in:

- Desktop header.
- Mobile header.
- Top-of-page header.
- White sticky header.
- Mobile menu.
- Footer.
- Contact page where applicable.
- Booking page where applicable.
- Booking review page.
- Booking success page.
- WhatsApp notification preview where appropriate.
- Email notification preview where appropriate.
- Any other visible LuxRide brand location.

Preserve:

- Original SVG proportions.
- Original colors.
- Transparent areas.
- Full vector quality.
- Safe spacing.

Do not:

- Stretch it.
- Compress it.
- Crop it.
- Recolor it.
- redraw it.
- Recreate it with text.
- Add artificial outlines.
- Add effects that reduce readability.
- Convert it to a low-resolution raster image.

If the logo is difficult to read on a dark, green, or white background, adjust the background or add a clean container.

Do not edit the logo itself.

Remove every old logo reference from the project.

==================================================
4. CLIENT VEHICLE IMAGES
==================================================

Use this exact mapping:

LuxRide-02.png
→ Mitsubishi Xpander 2027
→ MPV
→ Available
→ Up to 4 passengers and 4 bags

LuxRide-03.png
→ Toyota HiAce 2027
→ Minivan
→ Coming Soon
→ Up to 8 passengers and 8 bags

LuxRide-01.png
→ Toyota Corolla 2027
→ Sedan
→ Coming Soon
→ Up to 3 passengers and 2 bags

Replace all temporary vehicle images in:

- Homepage fleet preview.
- Fleet page.
- Booking vehicle selection.
- Booking details.
- Booking review.
- Transfer details.
- Booking success where relevant.
- Notification previews where relevant.
- Any other vehicle card or thumbnail.

Do not mix the images.

Use:

- object-fit: contain.
- White or light-neutral image containers.
- Equal container heights.
- Consistent baseline.
- Consistent padding.
- Proportional scaling.

Do not:

- Change vehicle colors.
- Change vehicle models.
- Stretch the images.
- Crop roofs or wheels.
- Generate missing vehicle parts.
- Add fake plates.
- Add artificial taxi signs.
- Add branding not present in the original uploaded image.
- Mirror the images in Arabic RTL mode.

The Xpander image already contains a LuxRide Taxi logo on the rear side window.

Preserve that existing logo exactly.

Do not:

- Remove it.
- Modify it.
- Redraw it.
- Copy it onto Corolla.
- Copy it onto HiAce.

==================================================
5. VEHICLE CUSTOMER CAPACITY
==================================================

Never display physical total seating capacity.

Do not show:

- Xpander: 7 passengers.
- HiAce: 15 passengers.
- Any count that includes the driver.
- “7 seats”.
- “15 seats”.

The client explained that displaying physical capacity can confuse travelers and cause luggage to be ignored.

Use only customer booking capacity.

Mitsubishi Xpander:

Category:
MPV

English:
Up to 4 passengers and 4 bags

Arabic:
حتى 4 ركاب و4 حقائب

Toyota Corolla:

Category:
Sedan

English:
Up to 3 passengers and 2 bags

Arabic:
حتى 3 ركاب وحقيبتين

Toyota HiAce:

Category:
Minivan

English:
Up to 8 passengers and 8 bags

Arabic:
حتى 8 ركاب و8 حقائب

Apply this everywhere:

- Homepage Fleet.
- Fleet page.
- Calculator.
- Vehicle selector.
- Booking Details.
- Booking Review.
- Transfer Details.
- Booking Success.
- WhatsApp preview.
- Email preview.
- English content.
- Arabic content.

==================================================
6. VEHICLE AVAILABILITY
==================================================

Mitsubishi Xpander:

- Category: MPV.
- Status: Available.
- Booking button enabled.
- Selectable in the real calculator.
- Maximum 4 passengers.
- Maximum 4 bags.

Toyota Corolla:

- Category: Sedan.
- Status: Coming Soon.
- Booking button disabled.
- Not selectable in the active calculator.
- Maximum 3 passengers.
- Maximum 2 bags.

Toyota HiAce:

- Category: Minivan.
- Status: Coming Soon.
- Booking button disabled.
- Not selectable in the active calculator.
- Maximum 8 passengers.
- Maximum 8 bags.

Only Xpander is currently bookable.

If Corolla and HiAce are shown in the calculator, they must appear clearly disabled with Coming Soon status.

Do not allow selecting them.

==================================================
7. VEHICLE CAPACITY VALIDATION
==================================================

When a vehicle is selected, passenger and luggage controls must follow that vehicle’s limits.

Xpander:

- Passenger maximum: 4.
- Luggage maximum: 4.

Corolla:

- Passenger maximum: 3.
- Luggage maximum: 2.

HiAce:

- Passenger maximum: 8.
- Luggage maximum: 8.

If a customer switches from a larger vehicle to a smaller vehicle:

- Reset an invalid passenger number.
- Reset an invalid luggage number.
- Show a clear validation message.

Example:

The selected vehicle supports up to 4 passengers and 4 bags.

Do not calculate capacity using physical seats.

==================================================
8. EXACT REFERENCE THEME
==================================================

Use this reference:

https://luxride.themepanthers.com

Use the uploaded screenshot of the LuxRide WordPress theme as an additional visual reference.

Use the reference only for:

- English heading typography.
- Body typography.
- Navigation typography.
- Button typography.
- Header spacing.
- Menu rhythm.
- Heading weights.
- Hero title proportions.
- Button proportions.
- Premium chauffeur-service character.

Do not copy:

- The text LUXRIDE as a replacement logo.
- Demo logo.
- Demo phone number.
- Red or coral branding.
- Login.
- Sign Up.
- Search.
- Blog.
- UK flag.
- Cookie notice.
- Demo images.
- Demo wording.
- Demo menu structure.
- Slider numbering.
- Driver/chauffeur stock image.
- Demo content.

LuxRide project identity remains:

Primary green:
#009933

Secondary orange:
#FF9933

Official uploaded LuxRide SVG logo.

==================================================
9. DETECT THE REAL ENGLISH FONT
==================================================

Inspect the reference theme’s stylesheets or computed styles.

Identify the actual font-family used for:

- Hero headings.
- Section headings.
- Navigation.
- Buttons.
- Body paragraphs.
- Form labels.

Priority:

1. Use the exact reference font if it is technically available.
2. Use an available equivalent from the same theme when possible.
3. If the exact font cannot be loaded, use the closest visually accurate legal alternative.
4. State the exact or fallback choice honestly in the final report.

Do not automatically assume Barlow Condensed is the exact font.

Do not automatically assume Oswald is the exact font.

Do not use serif typography.

The reference visual direction is:

- Modern sans-serif.
- Strong and bold.
- Clean.
- Geometric.
- Highly readable.
- Premium transport service.
- Not overly narrow.
- Not decorative.
- Not a fashion-style serif.

If the exact reference font is unavailable, use the closest match and mark:

NEEDS CLIENT INPUT: Exact original theme font file, only if truly required.

==================================================
10. TYPOGRAPHY AND TEXT SIZE
==================================================

The client said:

- Fonts are too small.
- Contrast is weak.
- English font does not match the reference theme.
- Arabic headings should use the same Arabic body font, but with a heavier weight.

Audit every page.

Improve:

- Header navigation.
- Hero heading.
- Supporting text.
- Section headings.
- Body paragraphs.
- Card headings.
- Card descriptions.
- Form labels.
- Form values.
- Prices.
- Alerts.
- FAQ text.
- Footer links.
- Mobile typography.

Do not use small pale-gray text.

English:

- Use the verified theme-style font.
- Use strong bold headings.
- Use a clean readable body font.
- Maintain a modern sans-serif look.

Arabic:

- Keep the same Arabic family used for body text.
- Use the same family for headings.
- Body: Regular or Medium.
- Headings: Bold, Extra Bold, or Black.
- Do not add a different decorative Arabic heading font.

Suggested target sizes, adjusted visually:

Desktop hero:
54–68px

Laptop hero:
48–58px

Mobile hero:
38–46px

Main section heading:
38–48px desktop

Mobile section heading:
30–36px

Card heading:
20–24px

Body:
16–18px

Navigation:
15–17px

Form labels:
At least 15–16px

Do not apply sizes blindly.
Review visual balance and wrapping.

==================================================
11. LIGHTER SITE AND CONTRAST
==================================================

The client said the current site is too dark.

Make the website lighter while preserving the premium character.

Use more:

- White backgrounds.
- Light neutral backgrounds.
- Bright cards.
- Dark readable text.
- Clear section separation.
- Comfortable whitespace.

Use dark sections only when they improve hierarchy.

Use green for:

- Primary buttons.
- Active navigation.
- Selected elements.
- Major brand accents.

Use orange for:

- Discounts.
- Last-minute Booking.
- Promotional labels.
- Important secondary notices.

Fix:

- Gray text on dark backgrounds.
- Light-gray text on white.
- Thin text over images.
- Weak form-label contrast.
- Weak footer-link contrast.

Do not make the entire homepage dark.

==================================================
12. HEADER AND SCROLL BEHAVIOR
==================================================

Create and test two states.

Top state:

Use the visually strongest approved option:

Option A:
Transparent/dark header over the hero.

Option B:
Primary green #009933 header.

Choose the version that makes the official SVG logo and navigation clearest.

Scrolled state:

- White background.
- Dark or green navigation.
- Official SVG logo visible.
- Subtle border or shadow.
- Stable height.
- No sudden logo resize.
- Language switcher visible.
- Booking CTA visible.
- Mobile menu visible.

Use the reference theme only for spacing and rhythm.

Do not copy its black/red identity.

Test:

- Desktop.
- Laptop.
- Tablet.
- Mobile.
- English.
- Arabic RTL.

==================================================
13. HERO SECTION
==================================================

Use this main heading:

Premium Private Transfers
in Hurghada

Improve:

- Line breaks.
- Font.
- Size.
- Line height.
- Maximum width.
- Alignment.
- Supporting-text width.
- Button spacing.
- Desktop balance.
- Mobile balance.

Do not leave an awkward single word on its own line.

Reduce excessive hero height.

The key first-screen content should be visible without a large initial scroll.

Keep:

- Calculate Your Price.
- Contact Us on WhatsApp.

Remove from the hero:

- Rated Excellent on Tripadvisor.
- Tripadvisor stars.
- Fixed prices · 24/7 support.
- Generic green Tripadvisor circles.
- Duplicate trust content.
- Any Tripadvisor widget.

Tripadvisor belongs only in its dedicated section.

==================================================
14. HOMEPAGE FINAL ORDER
==================================================

Use exactly this order:

1. Header
2. Compact Hero
3. Compact Estimate Your Trip calculator
4. Separate Last-minute Booking section
5. How It Works
6. What’s Included / Service Benefits
7. Popular Transfers
8. Destinations
9. Fleet Preview
10. Why Choose LuxRide
11. Tripadvisor Reviews
12. FAQ
13. Final CTA
14. Footer

Do not restore the short homepage section:

About LuxRide — Your Trusted Transfer Partner in Egypt

The full About Us content belongs on the dedicated About page.

==================================================
15. COMPACT HOMEPAGE CALCULATOR
==================================================

Title:

Estimate Your Trip

The homepage calculator must contain only:

- Trip type.
- Pickup location.
- Destination.
- Date.
- Pickup time.
- Vehicle.
- Passenger count.
- Luggage count.
- Continue button.

Button:

Continue to Trip Details

Do not show on the homepage:

- Full name.
- WhatsApp.
- Email.
- Passport.
- ID.
- Hotel name.
- Room number.
- Notes.
- Full price breakdown.
- Cancellation details.
- Final submission actions.

Preserve all Step 1 data when navigating to the booking page.

==================================================
16. BOOKING STEPS
==================================================

Use a clear three-step flow.

Step 1:

Estimate Your Trip

Fields:

- Trip type.
- Pickup.
- Destination.
- Date.
- Pickup time.
- Vehicle.
- Passengers.
- Luggage.

Step 2:

Your Details

Fields:

- Hotel or exact destination.
- Room number.
- Flight number when required.
- Passport or ID when required.
- Return date and time when required.
- Full name.
- WhatsApp number.
- Email.
- Notes.

Step 3:

Review & Send

Show:

- Trip type.
- Pickup.
- Destination.
- Hotel or exact destination.
- Departure date.
- Departure time.
- Return date and time.
- Vehicle.
- Passenger count.
- Luggage count.
- Customer name.
- WhatsApp.
- Email.
- Flight number.
- Passport/ID.
- Room number.
- Base price.
- Discount.
- Airport fee.
- Travel permit.
- Driver accommodation.
- Final total.
- Short cancellation policy.

Use a clear progress indicator.

Preserve values between all steps.

==================================================
17. ONE FINAL SUBMIT BUTTON
==================================================

This is a critical client instruction.

Remove all separate final buttons such as:

- Send via WhatsApp.
- Send via Email.
- Book on WhatsApp.
- Send by Email.

Use exactly one final button:

Send Booking Request

Arabic:

إرسال طلب الحجز

Show supporting text:

Your booking request will be sent to LuxRide through WhatsApp and email.

Arabic:

سيتم إرسال طلب الحجز إلى LuxRide عبر واتساب والبريد الإلكتروني.

The customer performs one action only.

During the future WordPress phase, one submission will be delivered to both WhatsApp and email.

For the prototype, show the intended behavior clearly.

==================================================
18. TRIP TYPES
==================================================

Use:

- One Way.
- Overday.
- Overnight.

Definitions:

One Way:
One-direction transfer.

Overday:
Departure and return on the same day.

Overnight:
Return on the following day or after an overnight stay.

Never calculate Overday or Overnight by doubling One Way.

Each trip type has a fixed route price.

Examples:

Luxor One Way:
€75

Luxor Overday:
€90

Sharm El Sheikh One Way:
€200

Sharm El Sheikh Overnight:
€250

==================================================
19. APPROVED PRICE TABLE
==================================================

Use EUR.

Use these approved prices:

Hurghada Airport – Domestic:
€10

Hurghada Airport – El Gouna:
€13

Hurghada Airport – Sahl Hasheesh:
€13

Hurghada Airport – Soma Bay:
€13

Hurghada Airport – Makadi:
€14

Hurghada Airport – Safaga:
€18

Hurghada Airport – Nefertari:
€28

Hurghada Airport – El Quseir:
€38

Hurghada Airport – Marsa Ghaleb:
€58

Hurghada Airport – Marsa Alam:
€65

Hurghada Airport – Hamata:
€90

Hurghada / City Tour – Alf Leila:
€22

El Gouna / City Tour – Alf Leila:
€27

Sahl Hasheesh / City Tour – Alf Leila:
€27

Makadi / City Tour – Alf Leila:
€28

Safaga or Soma Bay / City Tour – Alf Leila:
€35

Sharm El Naga:
€35

Transfer to Aswan:
€110

Transfer to Luxor:
€75

Transfer to Luxor from El Gouna:
€85

Transfer to Cairo:
€110

Luxor Overday:
€90

Luxor Overday from El Gouna:
€100

Cairo Overday:
€120

Cairo Overday from Makadi or Safaga:
€135

Zaafarana Overday:
€90

Alexandria Overnight:
€180

Driver overnight accommodation:
€33

Sharm El Sheikh One Way:
€200

Sharm El Sheikh Overnight:
€250

Rules:

- Tax is included.
- Prices are fixed according to the approved table.
- Do not invent missing prices.
- Do not invent route combinations.
- Unknown routes or mappings must be marked NEEDS CLIENT INPUT.
- The client will review the complete destination mapping and remaining route prices later.

==================================================
20. AIRPORT RULES
==================================================

Airport operating surcharge:

€2

Apply once only per applicable booking.

Apply when the journey is:

- Arriving from Hurghada Airport.
- Departing to Hurghada Airport.

Do not add the fee twice for a return booking.

Show it:

- On airport transfer cards.
- In the calculator.
- In the booking review.
- In the final total.

Flight number:

Required for airport-arrival pickups.

Show:

We monitor your flight in real time and adjust the pickup time in case of delays or early arrival.

Maximum airport arrival waiting time:

3 hours

==================================================
21. TRAVEL PERMITS
==================================================

Travel permits are mandatory for:

- Luxor.
- Aswan.
- Cairo.
- Sharm El Sheikh.

Apply once per booking.

Permit fees:

Sedan:
€20

MPV:
€20

Minivan:
€30

Show:

- Permit notice.
- Permit fee.
- Final total.

Require passport or ID for these routes.

Do not apply the fee twice for Overday or Overnight.

==================================================
22. DRIVER ACCOMMODATION
==================================================

Driver overnight accommodation:

€33

Add only when the selected route specifically requires accommodation.

Do not add it to every Overnight booking automatically.

When applicability is not known for a route:

- Do not guess.
- Mark NEEDS CLIENT INPUT.
- Keep the field configurable.

==================================================
23. DISCOUNTS
==================================================

Support route-specific discounts.

Example:

20% OFF

Cards must show:

- Discount badge.
- Old price.
- New price.
- Discount percentage.

Price summary must show:

- Base price.
- Discount amount.
- Discounted subtotal.
- Airport fee.
- Permit fee.
- Driver accommodation.
- Final total.

Do not hide airport or permit fees inside the discounted price.

==================================================
24. CASCADING ROUTES
==================================================

Pickup and destination dropdowns must be connected.

After selecting a pickup location:

- Show only valid destinations linked to it.
- Do not show invalid route combinations.

The complete route availability map is not yet finalized.

Therefore:

- Use only known mappings in existing approved data.
- Do not invent missing mappings.
- List incomplete mappings as NEEDS CLIENT INPUT.

==================================================
25. CONDITIONAL FIELDS
==================================================

Hotel or exact destination:

Always required.

Room number:

Optional.

Add a recommendation:

Adding your room number helps us coordinate your pickup more efficiently.

Flight number:

Required for airport-arrival pickups.

Passport or ID:

Required for:

- Luxor.
- Aswan.
- Cairo.
- Sharm El Sheikh.

Return date and time:

Show for Overday and Overnight where applicable.

Validate all required information before Review & Send.

==================================================
26. THREE-HOUR BOOKING CUT-OFF
==================================================

Standard online bookings require at least three hours before pickup.

Example:

Current time:
10:00 AM

Earliest normal booking:
1:00 PM

If the departure is less than three hours away:

- Block normal submission.
- Show a clear message.
- Show the Last-minute WhatsApp CTA.

Message:

Standard online booking is unavailable for this departure time. Please contact us on WhatsApp to check last-minute availability.

Do not allow the form to continue silently.

==================================================
27. LAST-MINUTE BOOKING
==================================================

Create a separate compact section outside the dark hero.

Use:

- White or light background.
- Orange #FF9933 accent.
- Clear WhatsApp CTA.
- Compact layout.

Heading:

Last-minute Booking

Text:

If you wish to book a transfer or another service for today, contact us directly on WhatsApp to check availability.

Button:

Check Availability on WhatsApp

Number:

+20 101 355 4009

Do not display it as a red error alert.

==================================================
28. HOW IT WORKS
==================================================

Use this section instead of the old short homepage About section.

Place it immediately after the calculator or before What’s Included.

Use four compact steps:

1. Choose Your Route

Select pickup, destination, date, and vehicle.

2. Check Your Price

Review the fixed price and clearly displayed applicable fees.

3. Send Your Booking

Complete your details and send one booking request.

4. Receive Confirmation

LuxRide confirms the driver, vehicle, and trip information.

Use:

- Four consistent icons.
- Short descriptions.
- Compact height.
- Horizontal desktop layout.
- Two-column or stacked mobile layout.

==================================================
29. ABOUT US PAGE
==================================================

Do not leave the About page unchanged if it still contains short, incorrect, or placeholder content.

Use the full previously supplied client content.

The About page must communicate:

- Premium reliable private transfers.
- Airport transfers.
- Door-to-door service.
- Hotel transfers.
- Red Sea destinations.
- Historical destinations.
- Long-distance journeys.
- Modern premium fleet.
- Safety and official compliance.
- Egyptian tourism regulations.
- Professional English-speaking drivers.
- Fixed transparent pricing.
- No hidden fees.
- Real-time flight monitoring.

Destination network includes:

- Hurghada.
- El Gouna.
- Sahl Hasheesh.
- Makadi Bay.
- Safaga.
- Soma Bay.
- Marsa Alam.
- Sharm El Sheikh.
- Luxor.
- Aswan.
- Cairo.
- Giza Pyramids.

Structure:

1. Introduction.
2. Mission.
3. Why Travel with LuxRide.
4. Modern Fleet.
5. Safety and Compliance.
6. Professional Drivers.
7. Fixed Transparent Prices.
8. Live Flight Tracking.
9. Destination Network.
10. Final CTA.

Do not use one very large paragraph.

Use:

- Short paragraphs.
- Icons.
- Cards.
- Images.
- Strong headings.

==================================================
30. WHAT’S INCLUDED
==================================================

Include:

- Private transportation.
- Admission fee information where applicable.
- Air-conditioned vehicle.
- Bottled water.
- WiFi on board.
- Front and rear USB Type-A/C charging.
- Real-time flight monitoring.
- Fixed transparent prices.
- Professional English-speaking drivers.
- No hidden fees.

The meaning of “Admission fee” is not fully confirmed.

Do not claim that all attraction admission fees are included.

Use safe customer-facing wording such as:

Admission fee information where applicable

Add this to NEEDS CLIENT INPUT:

Clarify whether admission fees are included in specific trips or only displayed as information.

==================================================
31. FLEET PAGE
==================================================

Show the three client vehicles.

Mitsubishi Xpander:

- Real uploaded image.
- MPV.
- Available.
- Up to 4 passengers.
- Up to 4 bags.
- Active booking button.

Toyota Corolla:

- Real uploaded image.
- Sedan.
- Coming Soon.
- Up to 3 passengers.
- Up to 2 bags.
- Disabled button.

Toyota HiAce:

- Real uploaded image.
- Minivan.
- Coming Soon.
- Up to 8 passengers.
- Up to 8 bags.
- Disabled button.

Do not show physical seat numbers.

Do not show 7 or 15.

==================================================
32. DESTINATIONS
==================================================

Include:

- Hurghada Airport.
- Hurghada.
- El Gouna.
- Sahl Hasheesh.
- Makadi Bay.
- Soma Bay.
- Safaga.
- El Quseir.
- Nefertari.
- Marsa Ghaleb.
- Marsa Alam.
- Hamata.
- Sharm El Naga.
- Sharm El Sheikh.
- Luxor.
- Aswan.
- Cairo and Giza.
- Zaafarana.
- Alexandria.

Use natural-color tourism images.

Remove:

- Dark image filters.
- Heavy overlays.
- Dark tint.
- Washed-out treatment.

Place long text outside the image.

Each destination or transfer card shows:

- Destination or route.
- Starting price.
- Approximate duration.
- Discount where applicable.
- Airport-fee note where applicable.
- Permit note where applicable.
- View Transfer.
- Book Now.

Do not show passengers or luggage on destination cards.

Clicking Book Now should open the calculator with the route preselected when data is available.

Use commercially safe or replaceable temporary images until the client provides owned images.

Do not intentionally copy competitor images.

==================================================
33. TRIPADVISOR
==================================================

Keep Tripadvisor only in the dedicated review section.

Use the official Tripadvisor logo or an accurate visual placeholder.

Do not use a generic green circle.

Create visual placeholders for:

1. Average rating and total review count.
2. Scrolling or animated reviews widget.
3. Write a Review widget.

Also show:

- Review cards.
- Reviewer name.
- Country or nationality.
- Star rating.
- Review text.
- Read All Reviews button.
- Write a Review button.

Do not install external Tripadvisor scripts in the Figma prototype.

Mark real script integration as WORDPRESS PHASE.

==================================================
34. SOCIAL MEDIA
==================================================

Use recognizable icons for:

- Facebook.
- Instagram.
- Tripadvisor.

Show them in:

- Footer.
- Contact page.
- Relevant social areas.

Use temporary safe links when final links are unavailable.

Do not create fake real profiles.

Mark these as NEEDS CLIENT INPUT:

- Final Facebook URL.
- Final Instagram URL.

==================================================
35. CONTACT PAGE
==================================================

Use:

Phone:
+20 101 355 4009

WhatsApp:
+20 101 355 4009

Email:

Use a clearly editable temporary email until the production email is supplied.

Do not present info@luxride.eg as final if it is only a placeholder.

Include:

- Contact form.
- Phone CTA.
- WhatsApp CTA.
- Facebook.
- Instagram.
- Tripadvisor.
- Booking-assistance section.
- Business-hours placeholder.
- Service-area visual.

Mark NEEDS CLIENT INPUT:

- Production business email.
- Facebook URL.
- Instagram URL.
- Final business hours.

==================================================
36. FAQ
==================================================

Include or correct:

Question:
Is the displayed transfer price final?

Answer:
The displayed base price is fixed and tax inclusive. Any applicable airport operating fee or mandatory travel permit is displayed separately and clearly before submission.

Question:
Can I request a child seat?

Answer:
This service is currently unavailable and will be provided soon.

Question:
How can I confirm my booking?

Answer:
Complete the booking form and select Send Booking Request. LuxRide will receive the request through WhatsApp and email and will contact you to confirm the details.

Question:
Can I book for today?

Answer:
Standard online bookings require at least three hours before departure. For a last-minute booking, contact LuxRide directly through WhatsApp.

Also include:

- What happens if my flight is delayed?
- How long will the driver wait at the airport?
- Are taxes included?
- Do long-distance journeys require permits?
- Can I book an Overday trip?
- Can I book an Overnight trip?
- Can I change my booking?
- What is the cancellation policy?
- How do I meet the driver?
- Can additional destinations be added?

==================================================
37. CANCELLATION POLICY
==================================================

Policy type:

Standard

Full refund:

The customer may cancel at least 24 hours before the experience start time in the local timezone.

No refund:

Cancellation less than 24 hours before the experience start time.

Show this consistently in:

- Cancellation Policy page.
- FAQ.
- Review & Send step.
- Booking confirmation summary.

Use matching English and Arabic wording.

==================================================
38. BOOKING NOTIFICATION PREVIEWS
==================================================

WhatsApp and email previews must include:

New Booking via LuxRide

- Customer name.
- Email.
- WhatsApp.
- Trip type.
- Pickup.
- Destination.
- Hotel or exact destination.
- Departure date and time.
- Return date and time.
- Vehicle.
- Passenger count.
- Luggage count.
- Flight number.
- Room number.
- Passport or ID.
- Base price.
- Discount.
- Airport fee.
- Travel permit.
- Driver accommodation.
- Final total.
- Notes.

Do not show physical vehicle seating capacity.

Actual message delivery is WORDPRESS PHASE.

==================================================
39. AVAILABILITY ADMIN PROTOTYPE
==================================================

Keep this as a visual prototype.

Include:

- Booking calendar.
- Block date.
- Block time.
- Pause all bookings.
- Daily confirmed booking limit.
- Default daily limit: 20.
- Pending status.
- Confirmed status.
- Cancelled status.
- Vehicle assignment.
- Automatic blocking.
- Manual override.
- Replacement vehicle available.
- Route blocking duration.
- Notes.

Route blocking durations:

Hurghada hotel transfers:
1 hour

Makadi:
2 hours

Sahl Hasheesh:
2 hours

El Gouna:
2 hours

Safaga:
4 hours

Marsa Alam:
6 hours

Zaafarana:
6 hours

Luxor:
12 hours

Alexandria:
24 hours

Sharm El Sheikh:
24 hours

Cairo:
24 hours

Aswan:
24 hours

Allow automatic blocking to be disabled when LuxRide can provide a replacement vehicle through a partner company.

Real blocking logic is WORDPRESS PHASE.

==================================================
40. REQUIRED PAGES AND ROUTES
==================================================

Verify:

- Home.
- About Us.
- Fleet.
- Destinations.
- Transfer Details.
- Booking.
- Contact.
- FAQ.
- Cancellation Policy.
- Booking Success.
- Booking Error.
- Validation States.
- Last-minute Booking.
- Availability Admin.
- WhatsApp Preview.
- Email Preview.

Test:

- Header links.
- Footer links.
- Logo home link.
- Book Now links.
- Transfer links.
- Direct URL opening.
- Page refresh.
- Breadcrumb accuracy.
- Language switching.

No:

- Blank routes.
- Duplicate header.
- Duplicate footer.
- Duplicate calculator.
- Broken links.
- Wrong redirects.

==================================================
41. MOBILE QA
==================================================

Test at:

- Large desktop.
- Standard laptop.
- Tablet.
- 390px mobile.
- 360px mobile.
- Very small mobile.

Fix:

- Horizontal overflow.
- Cropped text.
- Tiny fonts.
- Weak contrast.
- Oversized hero.
- Calculator overflow.
- Stepper overflow.
- Cropped vehicle images.
- Cropped destination images.
- Buttons outside viewport.
- Floating WhatsApp button covering actions.
- Mobile-menu problems.
- Footer overflow.
- Long price-summary overflow.
- Long-notice overflow.

The calculator must be easy to use on mobile.

==================================================
42. ARABIC RTL QA
==================================================

Test every customer-facing page in Arabic.

Verify:

- Correct RTL direction.
- Correct text alignment.
- Correct menu alignment.
- Correct header structure.
- Correct breadcrumbs.
- Correct progress-step order.
- Correct field-label alignment.
- Correct dropdown arrow position.
- Correct button-icon position.
- Phone number remains readable.
- EUR values remain readable.
- Times remain readable.
- English model names remain readable.
- Vehicle images are not mirrored.
- Logo is not mirrored.
- No untranslated navigation.
- No broken mixed-language sentences.

==================================================
43. SEO AND LLM-FRIENDLY VISUAL STRUCTURE
==================================================

Prepare the design for later implementation of:

- One H1 per page.
- Logical H2 and H3 hierarchy.
- Breadcrumbs.
- Dedicated destination pages.
- Dedicated route pages.
- Clear route names.
- Visible prices.
- Visible durations.
- FAQ content.
- Internal links.
- LocalBusiness schema.
- Service schema.
- FAQ schema.
- Breadcrumb schema.
- Review schema where permitted.

Do not add real schema code in the prototype.

Do not add keyword-stuffed paragraphs.

==================================================
44. CLIENT INPUT POLICY
==================================================

Do not invent missing information.

Fix everything with a clear confirmed requirement.

Place only genuinely missing information in NEEDS CLIENT INPUT.

Likely client-input items:

- Production business email.
- Final Facebook URL.
- Final Instagram URL.
- Final business hours.
- Complete pickup-to-destination availability map.
- Prices for unapproved route combinations.
- Exact driver-accommodation applicability by route.
- Clarification of admission-fee inclusion.
- Final owned destination photos.
- Exact original theme font file if it cannot be loaded.
- Additional official logo variant, only if needed.
- Missing Tripadvisor account or widget details.

Do not block client review when a neutral placeholder is sufficient.

==================================================
45. WORDPRESS-PHASE ITEMS
==================================================

Mark these as WORDPRESS PHASE, not missing from the Figma prototype:

- Real WordPress theme development.
- Real Tripadvisor scripts.
- Real WhatsApp delivery.
- Real email delivery.
- Database storage.
- Real availability locking.
- Real daily booking limit.
- Real automatic vehicle blocking.
- Real admin-controlled discounts.
- Real route management.
- WordPress admin pages.
- Hosting.
- Domain connection.
- SSL.
- Backups.
- Wordfence.
- Production email.
- SEO schema code.
- Performance optimization.

The prototype must still show the correct visual states and expected behavior.

==================================================
46. REQUIRED TEST SCENARIOS
==================================================

Run and report these scenarios.

Scenario 1:

Luxor One Way

Expected base price:
€75

Scenario 2:

Luxor Overday

Expected:
€90

It must not become €150.

Scenario 3:

Sharm El Sheikh One Way

Expected:
€200

Scenario 4:

Sharm El Sheikh Overnight

Expected:
€250

It must not become €400.

Scenario 5:

Hurghada Airport booking

Expected airport fee:
€2 once only

Scenario 6:

Luxor with Xpander MPV

Expected permit:
€20 once only

Scenario 7:

Discounted transfer

Expected summary:

- Old price.
- Discount.
- Discounted subtotal.
- Fees.
- Final total.

Scenario 8:

Airport arrival pickup

Flight number appears and is required.

Scenario 9:

Luxor, Aswan, Cairo, or Sharm El Sheikh

Passport or ID appears and is required.

Scenario 10:

Departure less than three hours away

- Standard booking blocked.
- Last-minute WhatsApp action displayed.

Scenario 11:

Xpander

- Maximum 4 passengers.
- Maximum 4 bags.
- Available.

Scenario 12:

Corolla

- Maximum 3 passengers.
- Maximum 2 bags.
- Coming Soon.
- Cannot be selected.

Scenario 13:

HiAce

- Maximum 8 passengers.
- Maximum 8 bags.
- Coming Soon.
- Cannot be selected.

Scenario 14:

Review & Send

Exactly one final Send Booking Request button.

Scenario 15:

Arabic mobile

- No horizontal overflow.
- Vehicles are not mirrored.
- Correct RTL.
- Readable prices and phone numbers.

==================================================
47. FINAL COMPLETION REPORT
==================================================

After inspecting, fixing, and testing, produce this report:

1. Final Readiness

Use exactly one:

READY FOR CLIENT REVIEW

or

NOT READY — CRITICAL ITEMS REMAIN

2. Requirements Matrix

For every major requirement show:

- Requirement.
- Status: PASS / FIXED / NEEDS CLIENT INPUT / WORDPRESS PHASE.
- File or route checked.
- Action taken.

3. Critical Fixes

Explicitly confirm:

- Official SVG logo replacement.
- Correct vehicle images.
- Removal of 7 and 15 physical-capacity text.
- Correct booking capacities.
- One final booking button.
- Correct pricing.
- Three-hour cut-off.
- Correct conditional fields.
- Mobile corrections.
- RTL corrections.

4. Pages Reviewed

List every reviewed route.

5. Typography Report

State:

- Actual reference-theme English font detected.
- How it was detected.
- Whether the exact font is loaded.
- Any fallback used.
- Arabic font and weights used.

6. Pricing Test Results

For each test show:

- Expected.
- Actual.
- Pass or fail.

7. Vehicle Audit

Confirm:

- Exact image mapping.
- Availability.
- Capacity.
- No old placeholder image.
- No mirrored image.
- No physical seat capacity displayed.

8. Mobile QA

State widths tested and fixes applied.

9. Arabic RTL QA

State pages checked and issues fixed.

10. Needs Client Input

Include only genuinely missing information.

For each item state:

- What is missing.
- Where it is used.
- Current temporary solution.
- Whether it prevents client review.

11. WordPress Phase

List intentionally deferred implementation items.

12. Final Recommendation

Use exactly one:

READY FOR CLIENT REVIEW

or

NOT READY — FIX THESE ITEMS FIRST

==================================================
48. FINAL INSTRUCTION
==================================================

Do not only return a report.

First:

- Inspect.
- Correct.
- Implement missing requirements.
- Test.
- Compare against this prompt.
- Then report.

Do not mark PASS based only on reading this prompt.

Do not hide incomplete work.

Do not invent client data.

Do not change the approved project scope.

Do not recommend buying credits.

Do not recommend creating unnecessary pages.

Complete every confirmed client requirement that can be implemented in the current prototype.