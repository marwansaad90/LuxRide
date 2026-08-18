import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

export function TermsPage() {
  const L = useL();
  const sections = [
    [L("Booking requests", "طلبات الحجز"), L("A submitted request is not confirmed until LuxRide accepts the transfer details and availability directly with the customer.", "لا يُعد الطلب المرسل مؤكداً حتى تعتمد LuxRide تفاصيل التوصيلة والتوفر مباشرةً مع العميل.")],
    [L("Prices and payment", "الأسعار والدفع"), L("The booking summary shows the applicable fixed base price and separately lists any configured airport, permit, discount or accommodation items before submission.", "يعرض ملخص الحجز السعر الأساسي الثابت المطبق، ويسرد بشكل منفصل أي رسوم مطار أو تصريح أو خصم أو مبيت مهيأة قبل الإرسال.")],
    [L("Passenger responsibilities", "مسؤوليات المسافر"), L("Customers must provide accurate pickup, contact, passenger, luggage, flight and identification details and be ready at the agreed pickup time.", "يجب على العملاء تقديم بيانات دقيقة للاستلام والاتصال والركاب والأمتعة والطيران والهوية، والاستعداد في وقت الاستلام المتفق عليه.")],
    [L("Changes and cancellation", "التعديل والإلغاء"), L("Changes depend on availability. A full refund applies when cancellation is made at least 24 hours before the experience start time in the local timezone; no refund applies inside 24 hours.", "تعتمد التعديلات على التوفر. ينطبق الاسترداد الكامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي؛ ولا ينطبق استرداد خلال 24 ساعة.")],
  ];
  return <PageShell crumb={L("Terms and Conditions", "الشروط والأحكام")} title={L("Terms and Conditions", "الشروط والأحكام")} subtitle={L("The main conditions for LuxRide transfer enquiries and booking requests.", "الشروط الأساسية لاستفسارات النقل وطلبات الحجز لدى LuxRide.")} tone="brand"><section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-3xl space-y-5 px-4 md:px-8">{sections.map(([title, text]) => <article key={title} className="rounded-2xl border border-lux-charcoal/10 bg-white p-7"><h2 className="text-lux-charcoal" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</h2><p className="mt-3 text-sm text-neutral-600" style={{ lineHeight: 1.7 }}>{text}</p></article>)}</div></section></PageShell>;
}
