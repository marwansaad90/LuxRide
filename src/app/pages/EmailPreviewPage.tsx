import { PageShell } from "../components/luxride/PageShell";
import { EMAIL, FLEET } from "../components/luxride/data";
import { LuxRideLogo } from "../components/luxride/LuxRideLogo";
import { useL } from "../components/luxride/i18n";

const FIELDS: [string, string][] = [
  ["Customer Name", "[Customer full name]"],
  ["Email", "[Customer email]"],
  ["WhatsApp", "[Customer WhatsApp]"],
  ["Trip Type", "Overday"],
  ["Route", "Hurghada → Luxor"],
  ["Hotel / Pickup", "[Hotel or exact destination]"],
  ["Destination", "Luxor"],
  ["Departure", "[Booking date and time]"],
  ["Return", "[Return date and time]"],
  ["Vehicle", "Mitsubishi Xpander 2027 (MPV) — up to 4 passengers and 4 bags"],
  ["Passengers", "4"],
  ["Luggage", "3"],
  ["Flight Number", "—"],
  ["Room Number", "[Optional]"],
  ["Passport / ID", "Provided"],
];

const PRICING: [string, string][] = [
  ["Base Price", "€90"],
  ["Discount", "-€13.50"],
  ["Discounted Subtotal", "€76.50"],
  ["Airport Surcharge", "€0"],
  ["Travel Permit", "€20"],
];

export function EmailPreviewPage() {
  const L = useL();
  const xpander = FLEET[0];

  return (
    <PageShell
      crumb={L("Email Notification", "إشعار البريد الإلكتروني")}
      title={L("Email Notification Preview", "معاينة إشعار البريد الإلكتروني")}
      subtitle={L(
        "The confirmation email generated for a booking request. Design preview only.",
        "بريد التأكيد الذي يتم إنشاؤه لطلب الحجز. معاينة تصميمية فقط.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div className="overflow-hidden rounded-3xl border border-lux-charcoal/10 bg-white shadow-xl" dir="ltr">
            {/* Email meta */}
            <div className="space-y-1 border-b border-lux-charcoal/10 bg-lux-beige/50 px-6 py-4 text-sm">
              <p><span className="text-neutral-400">{L("From", "من")}:</span> <span className="text-lux-charcoal">LuxRide &lt;{EMAIL ?? "production email required"}&gt;</span></p>
              <p><span className="text-neutral-400">{L("To", "إلى")}:</span> <span className="text-lux-charcoal">[Customer email]</span></p>
              <p><span className="text-neutral-400">{L("Subject", "الموضوع")}:</span> <span className="text-lux-charcoal">New Booking via LuxRide — LR-2026-00417</span></p>
            </div>

            {/* Header band */}
            <div className="bg-lux-dark px-6 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1"><LuxRideLogo className="h-14 w-14" /></div>
              <h2 className="mt-3 text-lux-beige" style={{ fontSize: "1.6rem", fontWeight: 700 }}>New Booking via LuxRide</h2>
              <p className="mt-1 text-sm text-lux-beige/60">Reference: LR-2026-00417</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-sm text-neutral-600">Hello LuxRide team, a new booking request has been submitted with the following details:</p>
              <img src={xpander.image} alt={xpander.name} className="mt-4 h-32 w-full rounded-xl bg-neutral-50 object-contain p-2" />

              <div className="mt-5 overflow-hidden rounded-xl border border-lux-charcoal/10">
                {FIELDS.map(([k, v], i) => (
                  <div key={k} className={`grid grid-cols-2 gap-3 px-4 py-2.5 text-sm ${i > 0 ? "border-t border-lux-charcoal/10" : ""}`}>
                    <span className="text-neutral-500">{k}</span>
                    <span className="text-lux-charcoal">{v}</span>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-lux-charcoal" style={{ fontSize: "1rem" }}>Price Breakdown</h3>
              <div className="mt-2 overflow-hidden rounded-xl border border-lux-charcoal/10">
                {PRICING.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-lux-charcoal/10 px-4 py-2.5 text-sm">
                    <span className="text-neutral-500">{k}</span>
                    <span className="text-lux-charcoal">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-lux-green/5 px-4 py-3 text-sm">
                  <span className="text-lux-charcoal">Final Total</span>
                  <span className="text-lux-green" style={{ fontWeight: 600 }}>€96.50</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-lux-beige p-4 text-sm text-neutral-600">
                <span className="text-neutral-400">Notes: </span>Guest requests infant seat.
              </div>
            </div>

            <div className="border-t border-lux-charcoal/10 px-6 py-4 text-center text-xs text-neutral-400">
              LuxRide · Premium Transfers in Egypt · This is an automated design-preview email.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
