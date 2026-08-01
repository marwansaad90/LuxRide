import { Link } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

export function FAQPage() {
  const L = useL();

  const faqs: { q: string; a: string }[] = [
    { q: L("Is the displayed transfer price final?", "هل السعر المعروض للنقل نهائي؟"), a: L("Yes. The price displayed in the calculator is fixed and inclusive, with no hidden fees. Airport operating fees and mandatory tourism travel permits are displayed separately and clearly before the booking is submitted.", "نعم. السعر المعروض في الحاسبة ثابت وشامل، بدون رسوم خفية. تُعرض رسوم تشغيل المطار وتصاريح السفر السياحي الإلزامية بشكل منفصل وواضح قبل إرسال الحجز.") },
    { q: L("Can I request a child seat?", "هل يمكنني طلب كرسي أطفال؟"), a: L("This service is currently unavailable and will be provided soon.", "هذه الخدمة غير متاحة حالياً وسيتم توفيرها قريباً.") },
    { q: L("How can I confirm my booking?", "كيف يمكنني تأكيد حجزي؟"), a: L("Complete the three booking steps and select the single Send Booking Request button. This prototype simulates submission; real WhatsApp and email delivery will be connected during the WordPress phase.", "أكمل خطوات الحجز الثلاث ثم اختر زر إرسال طلب الحجز الوحيد. يحاكي هذا النموذج الإرسال؛ وسيتم ربط واتساب والبريد الحقيقيين في مرحلة ووردبريس.") },
    { q: L("Can I make a booking for today?", "هل يمكنني الحجز لليوم؟"), a: L("Standard online bookings must be submitted at least three hours before departure. For last-minute or same-day bookings, contact LuxRide directly through WhatsApp to check availability.", "يجب تقديم الحجوزات القياسية عبر الإنترنت قبل ثلاث ساعات على الأقل من المغادرة. للحجوزات اللحظية أو في نفس اليوم، تواصل مع LuxRide مباشرةً عبر واتساب للتحقق من التوفر.") },
    { q: L("What happens if my flight is delayed?", "ماذا يحدث إذا تأخرت رحلتي الجوية؟"), a: L("LuxRide monitors the flight status in real time and adjusts the airport pickup time accordingly.", "تتابع LuxRide حالة الرحلة في الوقت الفعلي وتعدّل موعد استلام المطار وفقاً لذلك.") },
    { q: L("How long will the driver wait at the airport?", "كم سينتظر السائق في المطار؟"), a: L("The maximum waiting time for airport arrivals is three hours.", "الحد الأقصى لوقت الانتظار لوصول المطار هو ثلاث ساعات.") },
    { q: L("Do long-distance trips require travel permits?", "هل تتطلب الرحلات بعيدة المسافة تصاريح سفر؟"), a: L("Yes. Trips to Luxor, Aswan, Cairo, and Sharm El Sheikh require an official tourism and security permit. The applicable permit fee is displayed clearly in the final booking price.", "نعم. تتطلب الرحلات إلى الأقصر وأسوان والقاهرة وشرم الشيخ تصريحاً سياحياً وأمنياً رسمياً. تُعرض رسوم التصريح المطبقة بوضوح في السعر النهائي للحجز.") },
    { q: L("Can I book an Overday trip?", "هل يمكنني حجز رحلة يوم؟"), a: L("Yes. Overday trips depart and return on the same day and have their own fixed price — they are never calculated by doubling the one-way fare.", "نعم. تنطلق رحلات اليوم وتعود في نفس اليوم ولها سعرها الثابت الخاص — ولا تُحسب أبداً بمضاعفة سعر الذهاب.") },
    { q: L("Can I book an Overnight trip?", "هل يمكنني حجز رحلة مبيت؟"), a: L("Yes. Overnight trips return the following day or after an overnight stay. A driver overnight accommodation fee of €33 applies when relevant and is shown in the summary.", "نعم. تعود رحلات المبيت في اليوم التالي أو بعد مبيت. تُطبّق رسوم مبيت السائق البالغة €33 عند الحاجة وتظهر في الملخص.") },
    { q: L("Are taxes included?", "هل الضرائب مشمولة؟"), a: L("Yes. All prices are shown in EUR and are tax inclusive.", "نعم. جميع الأسعار معروضة باليورو وشاملة الضريبة.") },
    { q: L("Can I change my booking?", "هل يمكنني تعديل حجزي؟"), a: L("Yes. Contact us on WhatsApp with your booking details and we will do our best to accommodate changes based on availability.", "نعم. تواصل معنا عبر واتساب مع تفاصيل حجزك وسنبذل قصارى جهدنا لاستيعاب التغييرات حسب التوفر.") },
    { q: L("What is the cancellation policy?", "ما هي سياسة الإلغاء؟"), a: L("Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time.", "استرداد كامل عند الإلغاء قبل ٢٤ ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من ٢٤ ساعة من وقت البدء.") },
    { q: L("How do I meet the driver?", "كيف أقابل السائق؟"), a: L("For airport arrivals, your driver waits in the arrivals hall holding a sign with your name. For hotel pickups, the driver meets you at reception at the agreed time.", "لوصول المطار، ينتظرك السائق في صالة الوصول حاملاً لافتة باسمك. لاستلام الفنادق، يقابلك السائق في الاستقبال في الوقت المتفق عليه.") },
    { q: L("Can additional destinations be added?", "هل يمكن إضافة وجهات إضافية؟"), a: L("Yes. Mention any additional stops in your booking notes or on WhatsApp and we will provide an updated fixed price.", "نعم. اذكر أي محطات إضافية في ملاحظات حجزك أو عبر واتساب وسنوفّر سعراً ثابتاً محدّثاً.") },
  ];

  return (
    <PageShell
      crumb={L("FAQ", "الأسئلة الشائعة")}
      title={L("Frequently Asked Questions", "الأسئلة الشائعة")}
      subtitle={L("Everything you need to know about booking, pricing, permits and travelling with LuxRide.", "كل ما تحتاج معرفته عن الحجز والأسعار والتصاريح والسفر مع LuxRide.")}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-lux-charcoal/10 bg-white px-5">
                <AccordionTrigger className="text-start text-lux-charcoal hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-neutral-500">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 rounded-2xl border border-lux-green/25 bg-white p-7 text-center">
            <p className="text-lux-charcoal">{L("Still have a question?", "لا تزال لديك أسئلة؟")}</p>
            <p className="mt-1 text-sm text-neutral-500">{L("Our team is happy to help on WhatsApp.", "يسعد فريقنا بمساعدتك عبر واتساب.")}</p>
            <Link to="/contact" className="mt-4 inline-block rounded-full bg-lux-green px-7 py-3 text-sm text-white transition-all hover:brightness-110">{L("Contact Us", "اتصل بنا")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
