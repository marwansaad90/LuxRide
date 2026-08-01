import { CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { FLEET, whatsappLink } from "../components/luxride/data";
import { LuxRideLogo } from "../components/luxride/LuxRideLogo";
import { useL } from "../components/luxride/i18n";

export function BookingSuccessPage() {
  const L = useL();
  const { state } = useLocation();
  const booking = (state ?? {}) as Partial<{
    tripLabel: string;
    route: string;
    vehicleName: string;
    vehicleCategory: string;
    vehicleImage: string;
    departure: string;
    passengers: string;
    luggage: string;
    total: string;
  }>;
  const fallbackVehicle = FLEET[0];

  const summary = [
    { k: L("Trip type", "نوع الرحلة"), v: booking.tripLabel ?? L("Overday", "رحلة يوم") },
    { k: L("Route", "المسار"), v: booking.route ?? "Hurghada → Luxor" },
    { k: L("Vehicle", "السيارة"), v: `${booking.vehicleName ?? fallbackVehicle.name} (${booking.vehicleCategory ?? fallbackVehicle.category})` },
    { k: L("Departure", "المغادرة"), v: booking.departure ?? L("Provided in booking request", "مذكور في طلب الحجز") },
    { k: L("Passengers / bags", "الركاب / الحقائب"), v: `${booking.passengers ?? "4"} / ${booking.luggage ?? "4"}` },
    { k: L("Final total", "الإجمالي النهائي"), v: booking.total ?? "€96.50" },
  ];

  return (
    <PageShell
      crumb={L("Booking Submitted", "تم إرسال الحجز")}
      title={L("Your Request Has Been Submitted", "تم إرسال طلبك")}
      subtitle={L(
        "Thank you! Your booking request has been received and will be reviewed and confirmed shortly.",
        "شكراً لك! تم استلام طلب حجزك وسيتم مراجعته وتأكيده قريباً.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div className="rounded-3xl border border-lux-green/30 bg-white p-8 text-center">
            <LuxRideLogo className="mx-auto h-20 w-auto" />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lux-green/12">
              <CheckCircle2 className="h-9 w-9 text-lux-green" />
            </div>
            <h2 className="mt-5 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 700 }}>{L("Request received", "تم استلام الطلب")}</h2>
            <p className="mt-2 text-sm text-neutral-500">{L("Reference:", "المرجع:")} <span className="text-lux-charcoal">LR-2026-00417</span></p>

            <img
              src={booking.vehicleImage ?? fallbackVehicle.image}
              alt={booking.vehicleName ?? fallbackVehicle.name}
              className="mx-auto mt-5 h-36 w-full rounded-2xl bg-neutral-50 object-contain p-3"
              style={{ direction: "ltr" }}
            />

            <div className="mt-6 overflow-hidden rounded-2xl border border-lux-charcoal/10 text-start">
              {summary.map((r, i) => (
                <div key={r.k} className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${i > 0 ? "border-t border-lux-charcoal/10" : ""} ${r.k === L("Final total", "الإجمالي النهائي") ? "bg-lux-green/5" : ""}`}>
                  <span className="text-neutral-500">{r.k}</span>
                  <span className="text-lux-charcoal">{r.v}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-lux-beige p-4 text-start text-sm text-neutral-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-lux-green" />
              <span>{L("Our team typically confirms bookings within minutes during office hours, and always before your pickup time.", "يؤكّد فريقنا الحجوزات عادةً خلال دقائق في ساعات العمل، ودائماً قبل موعد استلامك.")}</span>
            </div>

            <p className="mt-4 text-start text-sm text-neutral-600">
              {L(
                "Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time.",
                "استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة.",
              )}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappLink("Hi LuxRide, I just submitted booking LR-2026-00417.")} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110">
                <MessageCircle className="h-4 w-4" /> {L("Message us on WhatsApp", "راسلنا على واتساب")}
              </a>
              <Link to="/" className="flex flex-1 items-center justify-center rounded-full border border-lux-charcoal/15 py-3 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green">
                {L("Back to Home", "العودة للرئيسية")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
