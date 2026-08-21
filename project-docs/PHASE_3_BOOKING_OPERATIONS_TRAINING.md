# LuxRide Phase 3 Booking Operations Training

Status: Phase 3 core operations draft.

## Booking Admin

Use WordPress Admin -> LuxRide -> Bookings.

- Review the analytics cards first: total bookings, upcoming bookings, today bookings, open new bookings, confirmed bookings, and non-cancelled EUR.
- Use filters for booking status, payment status, pickup date range, and search by reference, customer, or route.
- Open a booking with View to see readable customer, route, trip, required detail, and price sections.
- Do not use raw database tools for normal booking review. The booking detail page is the client-facing operations screen.

## Booking Status Workflow

Use the status form on the booking detail page.

- New: booking received and not yet confirmed.
- Pending: staff review is in progress.
- Confirmed: LuxRide accepted the booking.
- Assigned: driver/vehicle assignment is ready.
- Completed: trip finished.
- Cancelled: booking cancelled or rejected.

Availability-consuming statuses are: new, pending, confirmed, and assigned.
Cancelled bookings do not consume availability. Completed bookings do not consume future availability.

## Operations Fields

Use the Operations form on a booking detail page.

- Payment status: unpaid, deposit paid, paid, refunded.
- Payment note: short internal note for payment context.
- Driver name: assigned driver.
- Vehicle plate: assigned car or van plate.
- Customer rating: optional 0 to 5 rating after trip.
- Admin notes: private staff notes.

## Availability Blocks

Use WordPress Admin -> LuxRide -> Availability.

- Add or edit a block for one vehicle type or all vehicles.
- Set start and end date/time.
- Add a reason and note for staff context.
- Use the Active checkbox to decide whether a saved block currently affects booking availability.
- Delete a block only when the vehicle or time is available again.

The booking API rejects new bookings that overlap an active block or exceed the configured fleet count for the vehicle type.

## Booking Export

Use Export Excel (.xlsx) from LuxRide -> Bookings for the client-facing booking manifest.
Use Export bookings CSV only as a fallback/admin backup format.

The export has 38 fixed columns and opens in Excel. It includes booking reference, timing, status, cancellation reason, customer details, route, trip dates/times, vehicle assignment, passenger/luggage counts, child seat, price lines, payment details, flight number, special requests, and rating feedback. Empty fields stay blank.

## 38-Column Manifest Mapping

- Booking_Reference: booking reference.
- Created_At: booking creation timestamp.
- Confirmed_At: timestamp first set when booking status becomes confirmed.
- Booking_Status: current booking status.
- Cancel_Reason: admin-entered cancellation reason, blank when not populated.
- Customer_Name: customer full name.
- Customer_Phone: customer phone.
- Customer_Email: customer email, blank when not populated.
- Customer_Country: blank until a public country field exists.
- Customer_Language: booking language.
- Pickup_Location: route pickup label.
- Dropoff_Location: route destination label.
- Hotel_Room_Number: booking room number, blank when not populated.
- Trip_Type: one_way or round_trip.
- Trip_Category: one_way, overday, or overnight.
- Pickup_Date: pickup date.
- Pickup_Time: pickup time.
- Return_Date: return date, blank for one way.
- Return_Time: return time, blank for one way.
- Vehicle_Type: vehicle key.
- Assigned_Vehicle_Plates: admin-entered plate number.
- Assigned_Driver: admin-entered driver.
- Passenger_Count: passenger count.
- Luggage_Count: luggage count.
- Child_Seat: Yes or No.
- Base_Fare: numeric base fare.
- Airport_Fee: numeric airport fee.
- Travel_Permit_Fee: numeric permit fee.
- Driver_Overnight_Fee: numeric overnight/accommodation fee.
- Extra_Stops_Fee: blank until an extra-stops feature exists.
- Discount_Amount: numeric discount amount.
- Total_Amount: numeric total.
- Currency: booking currency.
- Payment_Method: admin-entered payment method, blank when not populated.
- Payment_Status: admin payment status.
- Flight_Number: flight number, blank when not populated.
- Special_Requests: customer notes only.
- Rating_Feedback: admin-entered rating feedback, blank when not populated.

## Notifications

New bookings trigger an admin email to the configured Admin notification email in LuxRide -> Pricing & Routes -> Fees & Rules.

If email delivery fails, the booking remains stored and `notification_status` is marked as failed for admin follow-up.

## Deployment Notes

After deploying the plugin files, WordPress loads schema version `0.4.0` and runs the dbDelta migration automatically. Do not import pricing again for this change; pricing routes and price values are not part of this Phase 3 operations patch.
