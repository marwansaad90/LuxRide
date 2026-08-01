EDIT THE EXISTING LUXRIDE FIGMA WEBSITE PROJECT.

DO NOT create a new website from scratch.
DO NOT replace the approved visual direction.
DO NOT remove the existing pages unless explicitly requested below.

Update and improve the current LuxRide design according to the following final client requirements.

The goal is to prepare a complete, realistic, premium, mobile-first Figma design that can later be converted into a custom WordPress theme.

Use the current LuxRide design as the foundation.

REFERENCE WEBSITE:
Use https://ben-driver-bordeaux.com/en only as a UX, content-organization, pricing-display, and booking-flow reference.

Do not copy its branding, wording, images, or exact layout.
The final design must preserve LuxRide’s own identity.

==================================================
1. CORE DESIGN DIRECTION
==================================================

Brand:
LuxRide

Business:
Premium private transportation, airport transfers, limousine services, tourist transfers, day trips, overday trips, and overnight transfers in Hurghada and across Egypt.

Target audience:
International tourists visiting Hurghada, Red Sea destinations, historical cities, and Egyptian tourist areas.

The website must feel:

- Premium
- Luxurious
- Trustworthy
- Safe
- Professional
- Modern
- Tourism-focused
- Easy to use
- Clear about prices
- Optimized for mobile booking

Keep the current approved design style, but improve its usability, content hierarchy, booking experience, and consistency.

Do not make the website look like a generic taxi website.
Do not use excessive animations or complicated layouts.
Do not introduce visual elements that would be difficult to reproduce in WordPress.

==================================================
2. BRAND COLORS AND TYPOGRAPHY
==================================================

Primary green:
#009933

Secondary orange:
#FF9933

Use green for:

- Main buttons
- Active elements
- Main backgrounds
- Selected fields
- Important icons
- Primary navigation highlights
- Booking confirmation actions

Use orange carefully for:

- Discounts
- Price highlights
- Secondary actions
- Notices
- Promotional labels
- Important booking conditions
- Small decorative details

Keep sufficient contrast and accessibility.

Avoid using too many colors.

Arabic typography:

- Keep the current readable Arabic body font.
- Use the same Arabic font for headings.
- Use Medium, Bold, or Extra Bold weights for headings.
- Ensure Arabic text is not too small on mobile.

English typography:

- Use a premium English font similar to the original LuxRide WordPress theme.
- Use a bold or condensed font for major headings.
- Use a clean, highly readable font for body content.

Prepare all components to support:

- English LTR
- Arabic RTL
- Future German
- Future Russian

==================================================
3. RESPONSIVE REQUIREMENTS
==================================================

Create or update:

- Desktop version
- Tablet behavior
- Full mobile version

Mobile is the main priority because most customers will use smartphones.

Mobile requirements:

- Large touch targets
- Clear booking fields
- No horizontal overflow
- Compact header
- Sticky booking or WhatsApp action where appropriate
- Easy date and time selection
- Clear final price
- Easy scrolling
- Short and readable paragraphs
- Correct RTL behavior
- Floating WhatsApp button
- Booking form usable with one hand

Use:

- Auto Layout
- Reusable components
- Responsive constraints
- Component variants
- Consistent spacing
- Text styles
- Color styles
- Design tokens

==================================================
4. HEADER
==================================================

Keep the current premium header style and update it to include:

- LuxRide official logo
- Home
- About Us
- Transfers
- Destinations
- Fleet
- Reviews
- FAQ
- Contact
- EN / AR language switcher
- WhatsApp contact
- Main CTA: Calculate Your Price
- Secondary CTA where suitable: Book Now

Create:

Desktop header
Mobile header
Sticky header state
Menu-open mobile state

Mobile header must contain:

- Logo
- Language switcher
- Hamburger button
- Visible WhatsApp or booking action

Add a floating WhatsApp button on every page.

WhatsApp number:
+20 101 355 4009

==================================================
5. HOMEPAGE STRUCTURE
==================================================

Keep the current homepage and refine it using this recommended order:

1. Header
2. Hero section
3. Booking and price calculator
4. Last-minute booking notice
5. Trust and service benefits
6. Popular transfers with prices
7. Popular destinations
8. Fleet preview
9. Why choose LuxRide
10. About LuxRide
11. Tripadvisor reviews
12. FAQ
13. Final booking CTA
14. Footer

The page should not feel crowded.

Use clear vertical spacing between sections.

==================================================
6. HERO SECTION
==================================================

Keep the premium visual direction.

Suggested heading:

Premium Private Transfers Across Hurghada and Egypt

Suggested supporting text:

Reliable airport transfers, private transportation, and comfortable long-distance journeys with fixed and transparent pricing.

Primary button:

Calculate Your Price

Secondary button:

Contact Us on WhatsApp

Use a bright and premium tourism or vehicle image.

Avoid heavy dark overlays.
Do not reduce image quality.
Make sure text remains readable without making the whole image dark.

Include trust indicators near the hero when appropriate:

- Fixed transparent prices
- Professional drivers
- Airport flight monitoring
- Private transportation
- 24/7 booking assistance

==================================================
7. SERVICE BENEFITS
==================================================

Add or improve a premium service-benefits section.

Include these benefits:

- Private transportation
- Admission fee information
- Air-conditioned vehicle
- Bottled water
- WiFi on board
- Front and rear USB Type-A/C charging
- Real-time flight monitoring
- Fixed and transparent prices
- Professional English-speaking drivers
- No hidden fees

Use elegant icons and short descriptions.

Clarify that “Admission fee” is displayed or explained when applicable and is not automatically included in every trip unless confirmed.

==================================================
8. BOOKING AND PRICE CALCULATOR
==================================================

Create a premium booking calculator design using predefined locations and fixed price tables.

Do not use Google Maps for price calculation.

The calculator should be visually simple, professional, and easy to use.

Recommended flow:

STEP 1 — TRIP TYPE

Trip options:

- One Way
- Overday
- Overnight

Do not label all return trips simply as “Round Trip”.

Overday:
Departure and return on the same day.

Overnight:
Return on the following day or after an overnight stay.

Each trip type has its own price from the approved price table.
Do not calculate return trips by doubling the one-way price.

Example:

Luxor One Way:
€75

Luxor Overday:
€90

Sharm El Sheikh One Way:
€200

Sharm El Sheikh Overnight:
€250

STEP 2 — ROUTE

Fields:

- Pickup location
- Destination
- Hotel or exact destination name
- Date
- Pickup time
- Return date when applicable
- Return time when applicable

Use cascading dropdowns:

After the customer selects the pickup location, show only destinations that are connected to that pickup location.

Do not display invalid route combinations.

The hotel or exact destination name is mandatory for all bookings.

Room number is optional but show a recommendation:

“Adding your room number helps us coordinate your pickup more efficiently.”

STEP 3 — VEHICLE AND CAPACITY

Fields:

- Vehicle
- Number of passengers
- Number of luggage items

Only active vehicles must be selectable.

STEP 4 — CUSTOMER INFORMATION

Fields:

- Full name
- WhatsApp number
- Email address
- Flight number when required
- Passport or ID number when required
- Optional room number
- Notes

STEP 5 — PRICE SUMMARY

Show:

- Selected trip type
- Pickup
- Destination
- Vehicle
- Base price
- Discount when applicable
- Airport surcharge when applicable
- Travel permit fee when applicable
- Departure date and time
- Return date and time when applicable
- Passenger count
- Luggage count
- Final total in EUR

Primary button:

Book Now via WhatsApp

Secondary option:

Send Booking via Email

Supporting note:

Your booking request will be reviewed and confirmed shortly.

==================================================
9. AIRPORT RULES
==================================================

Airport operating surcharge:

€2

Add this fee only once per booking when the trip is an arrival from or departure to Hurghada Airport.

Do not add the fee twice for return bookings.

Clearly show it inside the booking summary:

Airport operating surcharge:
€2

Also include the airport surcharge in displayed prices on airport transfer cards and airport destination pages.

Flight number:

The flight number is mandatory for airport arrival pickups.

When an airport arrival route is selected, reveal and require:

Flight Number

Display:

“We monitor your flight in real time and adjust the pickup time in case of delays or early arrival.”

Maximum airport arrival waiting time:

3 hours

==================================================
10. TRAVEL PERMIT RULES
==================================================

Travel permit fees are mandatory for these out-of-city destinations:

- Luxor
- Aswan
- Cairo
- Sharm El Sheikh

The permit fee is added once per booking, whether the booking is:

- One Way
- Overday
- Overnight

Permit fees:

Sedan:
€20

MPV:
€20

Minivan:
€30

Show the permit fee clearly in the calculator and on relevant destination or transfer pages.

Example booking summary:

Base transfer price:
€75

Travel permit:
€20

Final total:
€95

Display a clear notice:

“This journey requires an official tourism and security travel permit. LuxRide can arrange the required permit on your behalf.”

Reveal Passport / ID Number when one of these routes is selected.

==================================================
11. BOOKING CUT-OFF TIME
==================================================

A normal booking must be made at least 3 hours before the selected pickup time.

Do not allow a customer to make a standard booking when the trip begins in less than 3 hours.

Create a clear validation state.

Example:

Current time:
10:00 AM

The earliest allowed standard booking:
1:00 PM

Error message:

“This transfer must be booked at least 3 hours before departure.”

Alternative message:

“Standard online booking is unavailable for this departure time. Please contact us for a last-minute booking.”

==================================================
12. LAST-MINUTE BOOKING
==================================================

Create a highly visible section beside or directly below the booking calculator.

Heading:

Last-minute Booking

Content:

If you wish to book a transfer or any other service for today, please contact us directly on WhatsApp to check availability.

CTA:

Check Last-minute Availability on WhatsApp

Make the section visually noticeable but premium.

Use orange as an accent.

Do not make it look like an error message.

Create both desktop and mobile versions.

==================================================
13. DISCOUNT SYSTEM VISUALS
==================================================

Create visual support for discounts on selected routes.

Example discount:

20% OFF

Destination cards with discounts must show:

- Discount percentage badge
- Old price with strikethrough
- New discounted price
- Clear “Limited Offer” or “Special Offer” label when appropriate

Example:

Old price:
€100

New price:
€80

Discount:
20% OFF

The booking calculator summary must also show:

Base price
Discount amount
Discounted subtotal
Airport fee
Permit fee
Final total

Discounts should be route-specific and visually easy to understand.

==================================================
14. POPULAR TRANSFERS
==================================================

Create or update cards for popular transfers.

Each card must include:

- Bright destination image
- Route name
- Trip type when relevant
- Starting price in EUR
- Approximate duration
- Discount badge when applicable
- Airport or permit fee note when applicable
- Book This Transfer button

When the customer clicks a transfer card, the booking page should visually open with the pickup, destination, and trip type already selected.

Do not display passengers or luggage capacity on destination cards.

==================================================
15. DESTINATIONS PAGE
==================================================

Keep the existing destinations page and improve it.

Include:

- Hurghada Airport
- Hurghada
- El Gouna
- Sahl Hasheesh
- Makadi Bay
- Soma Bay
- Safaga
- El Quseir
- Nefertari
- Marsa Ghaleb
- Marsa Alam
- Hamata
- Sharm El Naga
- Sharm El Sheikh
- Luxor
- Aswan
- Cairo and Giza
- Zaafarana
- Alexandria

Use bright, colorful, attractive destination images.

Avoid heavily darkened images.
Avoid using competitor images where possible.
Use commercially permitted or replaceable placeholders.

Each destination card must show:

- Destination
- Starting price
- Approximate duration
- Book Now
- View Transfer

Do not show vehicle passenger and luggage capacity on destination cards.

Prepare reusable groups for future expansion:

- Hurghada and nearby resorts
- Marsa Alam region
- Sharm El Sheikh region
- Historical destinations
- Cairo, Giza, and Alexandria

==================================================
16. PRICE EXAMPLES
==================================================

Use these approved example prices in the visual design:

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

Transfer to Luxor:
€75

Transfer to Luxor from El Gouna:
€85

Luxor Overday:
€90

Luxor Overday from El Gouna:
€100

Transfer to Aswan:
€110

Transfer to Cairo:
€110

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

All prices:

- Displayed primarily in EUR
- Tax inclusive
- Fixed according to the approved price table
- Transparent
- Free from hidden charges except clearly displayed airport and permit fees

Do not place the full price table as one crowded homepage table.

Use selected popular routes on the homepage.
Show complete route information inside transfer pages and the calculator.

==================================================
17. FLEET PAGE
==================================================

Create a fleet page prepared for these three vehicles:

1. Toyota Corolla 2027

Category:
Sedan

Status:
Coming Soon / Currently Unavailable

2. Mitsubishi Xpander 2027

Category:
MPV

Capacity:
7 passengers, according to the final confirmed fleet information

Status:
Active and available

3. Toyota HiAce 2027

Category:
Minivan

Status:
Coming Soon / Currently Unavailable

Only Mitsubishi Xpander must appear as selectable inside the booking calculator at the current stage.

Toyota Corolla and Toyota HiAce must remain visible on the fleet page but:

- Use reduced opacity
- Show Coming Soon or Currently Unavailable
- Disable their booking button
- Do not include them as calculator options

Each vehicle card should include:

- Vehicle image
- Vehicle name
- Vehicle category
- Passenger capacity
- Luggage capacity
- Air conditioning
- USB charging
- WiFi when available
- Availability status
- Book button or disabled state

Prepare the component to allow additional vehicles later.

==================================================
18. AUTOMATIC AVAILABILITY CONCEPT
==================================================

Create the necessary public booking states and a conceptual WordPress admin interface for availability management.

Default maximum confirmed bookings per day:

20

Create UI states for:

- Available
- Limited availability
- Fully booked
- Date blocked
- Time blocked
- Vehicle blocked
- Manual override
- Booking pending
- Booking confirmed
- Booking cancelled

Automatic vehicle blocking durations:

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

The blocking duration should begin from the confirmed trip time.

Create an option in the conceptual admin interface to disable or override automatic blocking when LuxRide can arrange a replacement vehicle from a partner company.

Conceptual admin controls:

- Booking calendar
- Block date
- Block time
- Pause all bookings
- Maximum bookings per day
- Automatic blocking duration by route
- Enable automatic blocking
- Disable automatic blocking
- Manual vehicle availability override
- Booking status
- Vehicle assignment
- Replacement vehicle available
- Route duration
- Notes

This is a Figma visual concept only.
Do not attempt to create real WordPress functionality inside Figma.

==================================================
19. ABOUT US PAGE
==================================================

Create a structured About Us page using the client-provided content and the following content direction.

Main introduction:

Welcome to LuxRide, your premier choice for reliable, luxury, and hassle-free private transfers across Egypt’s Red Sea coast and top historical destinations.

LuxRide provides:

- Airport transfers
- Private transportation
- Hotel transfers
- Long-distance transfers
- Overday trips
- Overnight trips
- Historical and cultural journeys

Create content sections for:

- LuxRide introduction
- Company mission
- Modern and premium fleet
- Safety and official compliance
- Professional English-speaking drivers
- Fixed and transparent prices
- Live flight tracking
- Red Sea destination network
- Historical and intercity destination network
- Final booking CTA

Avoid displaying all content as one large paragraph.

Use:

- Image and text sections
- Icons
- Cards
- Statistics or trust highlights
- Short readable paragraphs

==================================================
20. TRIPADVISOR SECTION
==================================================

Merge the reviews page into the homepage as a premium section.

Create labeled visual placeholders for:

1. Tripadvisor scrolling reviews widget
2. Tripadvisor average rating and total number of reviews
3. Tripadvisor Write a Review widget

The actual Tripadvisor embed codes will be installed during WordPress development.

Design the section to include:

- Tripadvisor logo
- Average rating
- Review count
- Animated or horizontal review cards
- Reviewer name
- Country or nationality
- Five-star rating
- Review content
- Read All Reviews button
- Write a Review button

The external widgets must feel visually integrated into LuxRide’s design.

==================================================
21. CONTACT PAGE
==================================================

Add:

Phone:
+20 101 355 4009

WhatsApp:
+20 101 355 4009

Social platforms:

- Facebook
- Instagram
- Tripadvisor

Add an email placeholder that can be replaced after the hosting and domain email are configured.

Include:

- Contact form
- WhatsApp CTA
- Phone CTA
- Social media links
- Tripadvisor CTA
- Service area visual
- Business-hours placeholder
- Booking assistance section

Do not use Google Maps for calculating prices.

==================================================
22. FAQ
==================================================

Create FAQ sections on the homepage and a complete FAQ page.

Use these updated questions and answers.

Question:
Is the displayed transfer price final?

Answer:
Yes. The price displayed in the calculator is fixed and inclusive, with no hidden fees. Airport operating fees and mandatory tourism travel permits are displayed separately and clearly before the booking is submitted.

Question:
Can I request a child seat?

Answer:
This service is currently unavailable and will be provided soon.

Question:
How can I confirm my booking?

Answer:
After calculating your price, select “Book Now via WhatsApp” or send the booking by email. Our team will review your details and contact you shortly to confirm the reservation.

Question:
Can I make a booking for today?

Answer:
Standard online bookings must be submitted at least three hours before departure. For last-minute or same-day bookings, contact LuxRide directly through WhatsApp to check availability.

Question:
What happens if my flight is delayed?

Answer:
LuxRide monitors the flight status in real time and adjusts the airport pickup time accordingly.

Question:
How long will the driver wait at the airport?

Answer:
The maximum waiting time for airport arrivals is three hours.

Question:
Do long-distance trips require travel permits?

Answer:
Yes. Trips to Luxor, Aswan, Cairo, and Sharm El Sheikh require an official tourism and security permit. The applicable permit fee is displayed clearly in the final booking price.

Add other useful questions:

- Can I book an Overday trip?
- Can I book an Overnight trip?
- Are taxes included?
- Can I change my booking?
- What is the cancellation policy?
- How do I meet the driver?
- Can additional destinations be added?

==================================================
23. CANCELLATION POLICY
==================================================

Create a clear cancellation-policy section.

Policy type:
Standard

Content:

Travelers can cancel up to 24 hours before the experience start time in the local timezone and receive a full refund.

No refund is provided when the cancellation is made less than 24 hours before the experience start time.

Create:

- Short policy card near booking confirmation
- Full cancellation-policy section
- FAQ reference
- Mobile-friendly version

Use a calm and professional tone.

==================================================
24. BOOKING NOTIFICATION PREVIEW
==================================================

Create a visual preview of the WhatsApp and email booking notification.

Use this structure:

New Booking via LuxRide

Customer Name:
[Name]

Email:
[Email]

WhatsApp:
[WhatsApp Number]

Trip Type:
[One Way / Overday / Overnight]

Route:
[Pickup] → [Destination]

Hotel or Exact Destination:
[Hotel / Destination]

Departure Date and Time:
[Date] | [Time]

Return Date and Time:
[Return Date] | [Return Time]

Vehicle:
[Vehicle]

Passengers:
[Passenger Count]

Luggage:
[Luggage Count]

Flight Number:
[Flight Number]

Room Number:
[Room Number]

Passport or ID:
[Passport / ID]

Base Price:
[Base Price] €

Discount:
[Discount] €

Airport Surcharge:
[Airport Fee] €

Travel Permit:
[Permit Fee] €

Final Total:
[Final Total] €

Notes:
[Customer Notes]

Design one preview for WhatsApp and one for email.

==================================================
25. SEO AND LLM-FRIENDLY STRUCTURE
==================================================

Prepare the visual content hierarchy to support strong SEO and clear machine-readable content.

Use:

- One clear H1 per page
- Logical H2 and H3 hierarchy
- Dedicated destination pages
- Dedicated transfer route pages
- Clear route names
- Visible prices
- Approximate durations
- FAQ sections
- Breadcrumb areas
- Internal links
- Structured content cards
- Local business information
- Clear service descriptions
- Semantic page sections

Prepare the design for:

- LocalBusiness structured data
- Service structured data
- FAQ structured data
- Breadcrumb structured data
- Review structured data where permitted

Do not add large unreadable SEO paragraphs.

Create useful, readable content sections for real visitors.

==================================================
26. FOOTER
==================================================

Create a premium footer including:

- LuxRide logo
- Short business description
- Popular transfers
- Popular destinations
- Fleet
- Quick links
- Contact information
- Phone
- WhatsApp
- Facebook
- Instagram
- Tripadvisor
- EN / AR language switcher
- FAQ
- Cancellation Policy
- Privacy Policy
- Terms and Conditions
- Copyright

Mobile footer sections may use accordions.

==================================================
27. REQUIRED FIGMA PAGES
==================================================

Update or create these Figma pages and frames:

1. Desktop Homepage
2. Mobile Homepage
3. About Us
4. Fleet
5. Destinations
6. Transfer Details
7. Booking and Price Calculator
8. Contact
9. FAQ
10. Cancellation Policy
11. Booking Success / Request Submitted
12. Booking Error and Validation States
13. Last-minute Booking State
14. Conceptual Availability Admin
15. WhatsApp Notification Preview
16. Email Notification Preview

Prepare Arabic RTL component behavior.

A complete separate Arabic page design is optional at this step, but all components must be ready to flip correctly into RTL.

==================================================
28. COMPONENT VARIANTS
==================================================

Create component variants for:

- Desktop and mobile header
- English LTR and Arabic RTL
- Active and inactive vehicle
- Available and unavailable date
- Available and blocked time
- One Way
- Overday
- Overnight
- Airport and non-airport booking
- Intercity permit notice
- Discount and non-discount route
- Valid form field
- Error form field
- Required field
- Optional field
- Booking available
- Last-minute booking
- Fully booked
- Pending booking
- Confirmed booking
- Cancelled booking
- WhatsApp and email actions

==================================================
29. FINAL QUALITY CHECK
==================================================

Before finishing:

- Do not create a new website from scratch.
- Preserve the approved LuxRide visual identity.
- Ensure green #009933 is the main color.
- Ensure orange #FF9933 is the secondary accent.
- Check mobile usability carefully.
- Check all prices use EUR.
- Check Overday and Overnight are not calculated by doubling One Way.
- Check Sharm El Sheikh is €200 One Way and €250 Overnight.
- Check airport surcharge is €2 and added once.
- Check permits are €20 for Sedan and MPV and €30 for Minivan.
- Check hotel or exact destination is mandatory.
- Check room number is optional.
- Check flight number is mandatory for airport arrivals.
- Check the 3-hour booking cut-off is visible.
- Check Last-minute Booking is prominent.
- Check discounts are visible on cards and in calculator summaries.
- Check only Mitsubishi Xpander is active.
- Check Mitsubishi Xpander is labeled MPV.
- Check Tripadvisor placeholders are included.
- Check cancellation policy is included.
- Check the service benefits are included.
- Check the design can realistically be converted into WordPress.
- Check all frames are organized and clearly named.
- Do not use Lorem Ipsum.
- Use realistic LuxRide content.