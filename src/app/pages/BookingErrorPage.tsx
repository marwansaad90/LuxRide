import { AlertTriangle, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { whatsappLink } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

export function BookingErrorPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Booking Error", "خطأ في الحجز")}
      title={L("We Could Not Submit the Request", "تعذر إرسال الطلب")}
      subtitle={L(
        "This prototype error state shows the recovery options that will be connected during the WordPress phase.",
        "تعرض حالة الخطأ في النموذج خيارات الاستعادة التي سيتم ربطها خلال مرحلة ووردبريس.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-xl px-4 md:px-8">
          <div className="rounded-3xl border border-lux-orange/40 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lux-orange/15">
              <AlertTriangle className="h-8 w-8 text-lux-orange" />
            </div>
            <h2 className="mt-5 text-lux-charcoal" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("Your details are still safe", "لا تزال بياناتك محفوظة")}</h2>
            <p className="mt-2 text-neutral-600">{L("Return to the booking form and try again, or contact LuxRide on WhatsApp for urgent help.", "عُد إلى نموذج الحجز وحاول مجدداً، أو تواصل مع LuxRide عبر واتساب للمساعدة العاجلة.")}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/booking" className="flex flex-1 items-center justify-center rounded-full bg-lux-green py-3 text-sm text-white">{L("Return to Booking", "العودة للحجز")}</Link>
              <a href={whatsappLink("Hi LuxRide, I need help submitting my booking request.")} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-lux-orange/50 py-3 text-sm text-lux-charcoal"><MessageCircle className="h-4 w-4 text-lux-orange" />WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
