import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { settingsWhatsappLink, useSiteSettings } from "../components/luxride/cms";
import { LuxRideLogo } from "../components/luxride/LuxRideLogo";
import { WhatsAppIcon } from "../components/luxride/WhatsAppIcon";
import { useL } from "../components/luxride/i18n";

interface BookingSuccessState {
  bookingReference?: string;
  tripLabel: string;
  tripClassification?: string;
  route: string;
  vehicleName: string;
  vehicleCategory: string;
  vehicleImage: string;
  departure: string;
  passengers: string;
  luggage: string;
  childSeat?: boolean;
  total: string;
}

export function BookingSuccessPage() {
  const L = useL();
  const settings = useSiteSettings();
  const booking = useLocation().state as BookingSuccessState | null;

  if (!booking?.route || !booking.vehicleName || !booking.total) {
    return (
      <PageShell crumb={L("Booking", "الحجز")} title={L("Start a Booking Request", "ابدأ طلب حجز")} subtitle={L("Choose a valid route and complete the booking steps to create your trip summary.", "اختر مساراً صالحاً وأكمل خطوات الحجز لإنشاء ملخص رحلتك.")}>
        <section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-xl px-4 text-center md:px-8"><div className="rounded-3xl border border-lux-charcoal/10 bg-white p-8"><LuxRideLogo className="mx-auto h-20 w-auto" /><Link to="/booking" className="mt-6 inline-flex rounded-full bg-lux-green px-8 py-3 text-sm text-white">{L("Go to Booking", "انتقل إلى الحجز")}</Link></div></div></section>
      </PageShell>
    );
  }

  const summary = [
    ...(booking.bookingReference ? [{ k: L("Booking reference", "رقم الحجز"), v: booking.bookingReference }] : []),
    { k: L("Transfer type", "نوع التوصيلة"), v: booking.tripLabel },
    ...(booking.tripClassification ? [{ k: L("Route classification", "تصنيف المسار"), v: booking.tripClassification }] : []),
    { k: L("Route", "المسار"), v: booking.route },
    { k: L("Vehicle", "السيارة"), v: `${booking.vehicleName} (${booking.vehicleCategory})` },
    { k: L("Departure", "المغادرة"), v: booking.departure },
    { k: L("Passengers / bags", "الركاب / الحقائب"), v: `${booking.passengers} / ${booking.luggage}` },
    { k: L("Child seat", "كرسي أطفال"), v: booking.childSeat ? L("Yes, free", "نعم، مجاني") : L("No", "لا") },
    { k: L("Final total", "الإجمالي النهائي"), v: booking.total },
  ];

  return (
    <PageShell crumb={L("Booking Submitted", "تم إرسال الحجز")} title={L("Your Request Has Been Submitted", "تم إرسال طلبك")} subtitle={L("Thank you. Your booking request has been received and will be reviewed before confirmation.", "شكراً لك. تم استلام طلب حجزك وستتم مراجعته قبل التأكيد.")}>
      <section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-2xl px-4 md:px-8"><div className="rounded-3xl border border-lux-green/30 bg-white p-8 text-center">
        <LuxRideLogo className="mx-auto h-20 w-auto" /><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lux-green/12"><CheckCircle2 className="h-9 w-9 text-lux-green" /></div>
        <h2 className="mt-5 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 700 }}>{L("Request received", "تم استلام الطلب")}</h2>
        <img src={booking.vehicleImage} alt={booking.vehicleName} className="mx-auto mt-5 h-36 w-full rounded-2xl bg-neutral-50 object-contain p-3" style={{ direction: "ltr" }} />
        <div className="mt-6 overflow-hidden rounded-2xl border border-lux-charcoal/10 text-start">{summary.map((row, index) => <div key={row.k} className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${index > 0 ? "border-t border-lux-charcoal/10" : ""} ${row.k === L("Final total", "الإجمالي النهائي") ? "bg-lux-green/5" : ""}`}><span className="text-neutral-500">{row.k}</span><span className="break-words text-end text-lux-charcoal">{row.v}</span></div>)}</div>
        <p className="mt-5 text-start text-sm text-neutral-600">{L("Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time.", "استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة.")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row"><a href={settingsWhatsappLink(settings, "Hi LuxRide, I just submitted a booking request.")} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110"><WhatsAppIcon className="h-4 w-4" /> {L("Message us on WhatsApp", "راسلنا على واتساب")}</a><Link to="/" className="flex flex-1 items-center justify-center rounded-full border border-lux-charcoal/15 py-3 text-sm text-lux-charcoal">{L("Back to Home", "العودة للرئيسية")}</Link></div>
      </div></div></section>
    </PageShell>
  );
}
