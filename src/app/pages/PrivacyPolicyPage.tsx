import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

export function PrivacyPolicyPage() {
  const L = useL();
  const sections = [
    [L("Information we collect", "المعلومات التي نجمعها"), L("When you request a booking, LuxRide may collect the contact, journey, passenger, luggage, flight, hotel and identification details needed to arrange the service.", "عند طلب الحجز، قد تجمع LuxRide بيانات الاتصال والرحلة والركاب والأمتعة والطيران والفندق والهوية اللازمة لترتيب الخدمة.")],
    [L("How information is used", "كيفية استخدام المعلومات"), L("Booking information is used to prepare, communicate about and deliver the requested transfer, and to meet applicable transport and permit requirements.", "تُستخدم معلومات الحجز لإعداد الرحلة المطلوبة والتواصل بشأنها وتنفيذها، ولتلبية متطلبات النقل والتصاريح المعمول بها.")],
    [L("Sharing and retention", "المشاركة والاحتفاظ"), L("Information is shared only with service providers or authorities when reasonably required for the journey or by law, and retained only as long as needed for those purposes.", "تُشارك المعلومات فقط مع مقدمي الخدمة أو الجهات المختصة عند الحاجة المعقولة للرحلة أو بموجب القانون، ويُحتفظ بها للمدة اللازمة لهذه الأغراض.")],
    [L("Your choices", "خياراتك"), L("You may contact LuxRide to ask about, correct or request deletion of your booking information, subject to legal and operational requirements.", "يمكنك التواصل مع LuxRide للاستفسار عن معلومات حجزك أو تصحيحها أو طلب حذفها، مع مراعاة المتطلبات القانونية والتشغيلية.")],
  ];
  return <PageShell crumb={L("Privacy Policy", "سياسة الخصوصية")} title={L("Privacy Policy", "سياسة الخصوصية")} subtitle={L("How LuxRide handles information provided with transfer enquiries and booking requests.", "كيفية تعامل LuxRide مع المعلومات المقدمة في استفسارات النقل وطلبات الحجز.")}><section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-3xl space-y-5 px-4 md:px-8">{sections.map(([title, text]) => <article key={title} className="rounded-2xl border border-lux-charcoal/10 bg-white p-7"><h2 className="text-lux-charcoal" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</h2><p className="mt-3 text-sm text-neutral-600" style={{ lineHeight: 1.7 }}>{text}</p></article>)}</div></section></PageShell>;
}
