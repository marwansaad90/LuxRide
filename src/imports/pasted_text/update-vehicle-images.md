Use the three newly uploaded client-provided vehicle images in the EXISTING LuxRide prototype.

Do not generate new vehicle images.
Do not redesign the website.
Do not change the booking logic, routes, prices, colors, typography, or page structure.
Only replace the existing temporary vehicle images and carefully adjust their presentation.

==================================================
1. EXACT IMAGE MAPPING
==================================================

Use the uploaded images according to this exact mapping:

LuxRide-02.png
→ Mitsubishi Xpander 2027
→ Category: MPV
→ Status: Available
→ Booking capacity: Maximum 4 passengers and 4 luggage items

LuxRide-03.png
→ Toyota HiAce 2027
→ Category: Minivan
→ Status: Coming Soon
→ Booking capacity when enabled in the future: Maximum 8 passengers and 8 luggage items

LuxRide-01.png
→ Toyota Corolla 2027
→ Category: Sedan
→ Status: Coming Soon
→ Booking capacity when enabled in the future: Maximum 3 passengers and 2 luggage items

Do not assign any image to the wrong vehicle.

==================================================
2. PRESERVE THE ORIGINAL VEHICLE IMAGES
==================================================

Use the client-provided images exactly as supplied.

Do not:

- Change the vehicle model.
- Change the vehicle color.
- Change the wheels.
- Change the windows.
- Stretch or distort the vehicle.
- Crop important parts of the vehicle.
- Generate missing vehicle parts.
- Add artificial backgrounds.
- Add taxi signs.
- Add fake license plates.
- Add additional branding.
- Replace the vehicles with stock images.

The Mitsubishi Xpander image already contains a LuxRide Taxi logo on the rear side window.

Preserve this existing logo exactly as it appears.

Do not remove it.
Do not redraw it.
Do not modify it.
Do not copy or add the same logo to the Toyota Corolla or Toyota HiAce images.

Use the Toyota Corolla and Toyota HiAce images as supplied without adding artificial LuxRide branding.

==================================================
3. REPLACE VEHICLE IMAGES EVERYWHERE
==================================================

Replace the previous temporary vehicle images in all existing locations, including:

- Homepage fleet preview.
- Fleet page.
- Vehicle cards.
- Booking calculator vehicle selection.
- Booking details page.
- Review and confirmation page.
- Booking success page where applicable.
- WhatsApp notification preview if a vehicle image is displayed.
- Email notification preview if a vehicle image is displayed.
- Transfer details page.
- Any other existing vehicle preview component.

Search the full project and ensure no old temporary fleet image remains.

==================================================
4. CONSISTENT VISUAL PRESENTATION
==================================================

The three images have white backgrounds and side-profile views.

Present them consistently using:

- Equal image containers.
- The same card height.
- The same visual baseline.
- Consistent horizontal and vertical spacing.
- A clean white or very light neutral image area.
- object-fit: contain.
- Centered vehicle alignment.
- Consistent internal padding.

Do not use object-cover when it cuts off the vehicle.

The full vehicle should remain visible whenever possible.

Do not cut:

- Wheels.
- Front bumper.
- Rear bumper.
- Roof.
- Vehicle body.

Because the three vehicles have different physical sizes, visually normalize them without distorting them:

- Corolla should not appear as large as HiAce.
- HiAce should retain its larger minivan appearance.
- Xpander should appear between Corolla and HiAce in visual scale.

Use proportional scaling only.

==================================================
5. VEHICLE CARD CONTENT
==================================================

Mitsubishi Xpander 2027:

Category:
MPV

Status:
Available

Capacity:
Up to 4 passengers

Luggage:
Up to 4 bags

Button:
Book This Vehicle

The booking button must remain active.

This must remain the only currently selectable vehicle in the booking calculator.

Toyota Corolla 2027:

Category:
Sedan

Status:
Coming Soon

Capacity:
Up to 3 passengers

Luggage:
Up to 2 bags

Button:
Coming Soon

The button must be disabled.

Do not include the Corolla as a selectable option in the active booking calculator.

Toyota HiAce 2027:

Category:
Minivan

Status:
Coming Soon

Capacity:
Up to 8 passengers

Luggage:
Up to 8 bags

Button:
Coming Soon

The button must be disabled.

Do not include the HiAce as a selectable option in the active booking calculator.

==================================================
6. BOOKING CALCULATOR
==================================================

Keep Mitsubishi Xpander as the only active vehicle.

Use the real client-provided Xpander image in the calculator vehicle-selection component.

Display:

Mitsubishi Xpander
MPV
Up to 4 passengers and 4 bags

Do not allow:

- More than 4 passengers.
- More than 4 luggage items.

Do not enable Corolla or HiAce in the calculator.

You may display them as disabled Coming Soon options only if this does not confuse the customer.

==================================================
7. MOBILE RESPONSIVENESS
==================================================

Review the vehicle images on:

- Desktop.
- Laptop.
- Tablet.
- Mobile.
- Very small mobile.

Ensure:

- No image extends outside its card.
- No horizontal page overflow.
- No vehicle is cropped.
- Text does not overlap the vehicle.
- Coming Soon badges remain readable.
- The booking button remains accessible.
- The floating WhatsApp button does not cover fleet content.
- Images remain sharp and proportional.

Use a smaller image container on mobile while keeping the entire vehicle visible.

==================================================
8. ARABIC RTL
==================================================

Review the fleet components in Arabic RTL mode.

Ensure:

- Vehicle images are not mirrored.
- Vehicle model names remain readable.
- English model names remain in the correct order.
- Capacity numbers are not reversed.
- Status badges appear in the correct position.
- Text alignment follows RTL.
- Buttons and icons align correctly.

Never mirror or horizontally flip the uploaded car images.

==================================================
9. IMAGE QUALITY
==================================================

Preserve the highest available quality.

Do not apply:

- Heavy compression.
- Blur.
- Dark overlays.
- Color filters.
- Green tint.
- Orange tint.
- Excessive shadows.
- Artificial reflections.

A subtle natural shadow beneath the vehicle may be preserved because it already exists in the provided images.

Do not make the background dark.

==================================================
10. FINAL VERIFICATION
==================================================

Before completing, confirm:

- LuxRide-02.png is used only for Mitsubishi Xpander.
- LuxRide-03.png is used only for Toyota HiAce.
- LuxRide-01.png is used only for Toyota Corolla.
- The Xpander’s existing LuxRide Taxi logo remains unchanged.
- No logo was artificially added to Corolla or HiAce.
- No old placeholder vehicle image remains.
- No vehicle image is distorted.
- No important vehicle part is cropped.
- Xpander remains Available.
- Corolla remains Coming Soon.
- HiAce remains Coming Soon.
- Only Xpander is selectable in the active booking calculator.
- Passenger and luggage limits remain correct.
- Desktop and mobile layouts are consistent.
- Arabic RTL does not mirror the vehicle images.

After completion, report:

1. Every page where the images were replaced.
2. Confirmation of the exact image-to-vehicle mapping.
3. Any old placeholder that could not be located or replaced.
4. Mobile image adjustments made.
5. Any image-quality limitation found in the uploaded files.