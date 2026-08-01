import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

export function CancellationPolicyPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Cancellation Policy", "سياسة الإلغاء")}
      title={L("Cancellation Policy", "سياسة الإلغاء")}
      subtitle={L(
        "A clear, standard policy so you can book with confidence.",
        "سياسة قياسية وواضحة حتى تحجز بثقة.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-lux-green/30 bg-white p-7">
              <CheckCircle2 className="h-8 w-8 text-lux-green" />
              <h3 className="mt-4 text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{L("Full refund", "استرداد كامل")}</h3>
              <p className="mt-2 text-sm text-neutral-500" style={{ lineHeight: 1.6 }}>
                {L(
                  "Cancel at least 24 hours before the experience start time (local timezone) and receive a full refund.",
                  "ألغِ قبل ٢٤ ساعة على الأقل من موعد بدء الرحلة (بالتوقيت المحلي) واحصل على استرداد كامل.",
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-lux-orange/40 bg-white p-7">
              <XCircle className="h-8 w-8 text-lux-orange" />
              <h3 className="mt-4 text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{L("No refund", "لا استرداد")}</h3>
              <p className="mt-2 text-sm text-neutral-500" style={{ lineHeight: 1.6 }}>
                {L(
                  "No refund is provided when the cancellation is made less than 24 hours before the experience start time.",
                  "لا يُقدَّم استرداد عند الإلغاء قبل أقل من ٢٤ ساعة من موعد بدء الرحلة.",
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-lux-charcoal/10 bg-white p-7">
            <h2 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              <Clock className="h-5 w-5 text-lux-green" /> {L("How it works", "كيف تعمل")}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600" style={{ lineHeight: 1.6 }}>
              <li>{L("• Cancellation times are calculated in the local timezone of the experience.", "• تُحتسب أوقات الإلغاء بالتوقيت المحلي للرحلة.")}</li>
              <li>{L("• To cancel or change a booking, contact us on WhatsApp with your booking details.", "• للإلغاء أو التعديل، تواصل معنا عبر واتساب مع تفاصيل حجزك.")}</li>
              <li>{L("• Refunds are processed to the original payment method where applicable.", "• تتم المبالغ المستردة إلى وسيلة الدفع الأصلية عند الاقتضاء.")}</li>
            </ul>
          </div>

          <div className="mt-8 rounded-2xl bg-lux-dark p-7 text-center text-lux-beige">
            <p>{L("Need to change or cancel a booking?", "تحتاج لتعديل أو إلغاء حجز؟")}</p>
            <Link to="/contact" className="mt-4 inline-block rounded-full bg-lux-green px-7 py-3 text-sm text-white transition-all hover:brightness-110">{L("Contact Us", "اتصل بنا")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
