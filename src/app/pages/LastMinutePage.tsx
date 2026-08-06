import { Clock, Zap } from "lucide-react";
import { PageShell } from "../components/luxride/PageShell";
import { PHONE_DISPLAY, whatsappLink } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";
import { WhatsAppIcon } from "../components/luxride/WhatsAppIcon";

export function LastMinutePage() {
  const L = useL();

  const steps = [
    { t: L("Message us on WhatsApp", "راسلنا على واتساب"), d: L("Tell us your route, time and number of passengers for today.", "أخبرنا بمسارك ووقتك وعدد الركاب لليوم.") },
    { t: L("We check availability", "نتحقق من التوفر"), d: L("We confirm whether a vehicle and driver are available for your requested time.", "نؤكّد ما إذا كانت هناك سيارة وسائق متاحان لوقتك المطلوب.") },
    { t: L("Instant confirmation", "تأكيد فوري"), d: L("If available, we confirm your fixed price and pickup details right away.", "إذا كان متاحاً، نؤكّد سعرك الثابت وتفاصيل الاستلام على الفور.") },
  ];

  return (
    <PageShell
      crumb={L("Last-minute Booking", "الحجز اللحظي")}
      title={L("Last-minute Booking", "الحجز اللحظي")}
      subtitle={L(
        "Standard online bookings require at least 3 hours' notice. Travelling sooner? We can still help — just reach out on WhatsApp.",
        "تتطلب الحجوزات القياسية عبر الإنترنت مهلة ٣ ساعات على الأقل. تسافر أقرب من ذلك؟ لا يزال بإمكاننا المساعدة — تواصل معنا عبر واتساب.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="rounded-3xl border border-[#CC9966]/40 bg-gradient-to-br from-[#CC9966]/15 to-transparent p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#CC9966]/20">
              <Zap className="h-8 w-8 text-[#A87542]" />
            </div>
            <h2 className="mt-5 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 700 }}>{L("Need a transfer today?", "تحتاج رحلة اليوم؟")}</h2>
            <p className="mx-auto mt-2 max-w-lg text-neutral-600">{L("If you wish to book a transfer or any other service for today, please contact us directly on WhatsApp to check availability.", "إذا كنت ترغب في حجز رحلة أو أي خدمة أخرى لليوم، يرجى التواصل معنا مباشرةً عبر واتساب للتحقق من التوفر.")}</p>
            <a href={whatsappLink("Hi LuxRide, I'd like to check last-minute availability for today.")} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#CC9966] px-8 py-3.5 text-sm text-white transition-all hover:brightness-105">
              <WhatsAppIcon className="h-5 w-5" /> {L("Check Last-minute Availability on WhatsApp", "تحقق من التوفر اللحظي عبر واتساب")}
            </a>
            <p className="mt-3 font-semibold text-lux-charcoal" dir="ltr">{PHONE_DISPLAY}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.t} className="rounded-2xl border border-lux-charcoal/8 bg-white p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lux-green/12 text-sm text-lux-green">{i + 1}</span>
                <h3 className="mt-3 text-lux-charcoal" style={{ fontSize: "1.05rem" }}>{s.t}</h3>
                <p className="mt-1 text-sm text-neutral-500">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-2 rounded-xl bg-white p-4 text-sm text-neutral-600">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-lux-green" />
            <span>{L("Last-minute availability depends on driver and vehicle schedules and cannot be guaranteed, but we always do our best.", "يعتمد التوفر اللحظي على جداول السائقين والسيارات ولا يمكن ضمانه، لكننا دائماً نبذل قصارى جهدنا.")}</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
