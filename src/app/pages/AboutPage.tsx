import {
  BadgeCheck,
  CarFront,
  MapPin,
  PlaneLanding,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { IMAGES } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

export function AboutPage() {
  const L = useL();
  const cards = [
    { icon: Sparkles, title: L("Why Choose LuxRide", "لماذا تختار LuxRide"), text: L("Every transfer is planned as a private, door-to-door service with clear pickup details, comfortable transport and direct support when you need it.", "تُخطط كل توصيلة كخدمة خاصة من الباب إلى الباب مع تفاصيل استلام واضحة وتنقل مريح ودعم مباشر عند الحاجة.") },
    { icon: CarFront, title: L("Fleet and Comfort", "الأسطول والراحة"), text: L("The modern fleet includes a family car, sedan and minivan matched to the passenger and luggage requirements shown during booking.", "يشمل الأسطول الحديث سيارة عائلية وسيدان وميني فان، وتطابق خياراته متطلبات الركاب والأمتعة المعروضة أثناء الحجز.") },
    { icon: ShieldCheck, title: L("Safety and Compliance", "السلامة والامتثال"), text: L("LuxRide arranges transfers with licensed vehicles and drivers in line with applicable Egyptian tourism transport and travel-permit requirements.", "ترتّب LuxRide التوصيلات بسيارات وسائقين مرخصين وفق متطلبات النقل السياحي وتصاريح السفر المعمول بها في مصر.") },
    { icon: BadgeCheck, title: L("Professional Drivers", "سائقون محترفون"), text: L("Courteous, experienced English-speaking drivers focus on safe driving, punctual pickup and a calm guest experience.", "يركز السائقون المحترفون ذوو الخبرة والمتحدثون بالإنجليزية على القيادة الآمنة والاستلام في الموعد وتجربة مريحة للضيف.") },
    { icon: Wallet, title: L("Transparent Pricing", "أسعار شفافة"), text: L("Approved fares are fixed in EUR and tax inclusive. Applicable airport or permit fees are listed separately before submission, with no hidden charges.", "الأسعار المعتمدة ثابتة باليورو وشاملة الضريبة. تُدرج رسوم المطار أو التصريح المطبقة بشكل منفصل قبل الإرسال، من دون رسوم خفية.") },
    { icon: PlaneLanding, title: L("Flight Monitoring", "متابعة الطيران"), text: L("For airport arrivals, flight details allow the team to monitor the arrival and adjust pickup timing when a flight is delayed or lands early.", "عند الوصول من المطار، تتيح تفاصيل التوصيلة الجوية للفريق متابعة الوصول وتعديل موعد الاستلام عند التأخر أو الهبوط المبكر.") },
    { icon: MapPin, title: L("Destination Network", "شبكة الوجهات"), text: L("LuxRide serves Hurghada and Red Sea resorts, airport and hotel transfers, and long-distance private transfers to destinations including Luxor, Aswan, Cairo and Sharm El Sheikh.", "تخدم LuxRide الغردقة ومنتجعات البحر الأحمر، وتوصيلات المطار والفنادق، والتوصيلات الخاصة بعيدة المسافة إلى وجهات تشمل الأقصر وأسوان والقاهرة وشرم الشيخ.") },
  ];

  return (
    <PageShell
      crumb={L("About Us", "من نحن")}
      title={L("About LuxRide", "عن LuxRide")}
      subtitle={L("Premium private transportation from Hurghada across the Red Sea coast and Egypt's leading destinations.", "نقل خاص متميز من الغردقة عبر ساحل البحر الأحمر وأبرز وجهات مصر.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24" aria-labelledby="about-introduction">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-white/70 bg-white p-2 shadow-[0_20px_60px_rgba(15,22,35,0.10)]">
            <ImageWithFallback loading="lazy" src={IMAGES.aboutTransfer} alt={L("LuxRide private transfer pickup at a Hurghada hotel", "استلام توصيلة LuxRide خاصة عند فندق في الغردقة")} className="h-full w-full rounded-2xl object-cover object-center" />
          </div>
          <div>
            <h2 id="about-introduction" className="text-lux-charcoal" style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 800, lineHeight: 1.12 }}>{L("Premium private transportation", "نقل خاص متميز")}</h2>
            <p className="mt-5 text-neutral-700" style={{ lineHeight: 1.85 }}>{L("LuxRide provides private airport transfers, door-to-door hotel transfers, Red Sea resort transportation, and long-distance private transfers. Each service is arranged around the guest's confirmed route, timing, group and luggage.", "توفّر LuxRide توصيلات مطار خاصة، ونقلاً من الباب إلى الباب للفنادق، وتنقلاً إلى منتجعات البحر الأحمر، وتوصيلات خاصة بعيدة المسافة. تُرتب كل خدمة وفق المسار والموعد والمجموعة والأمتعة المؤكدة للضيف.")}</p>
            <div className="mt-7 rounded-2xl border border-lux-client-accent/35 bg-white p-5 text-sm text-neutral-700 shadow-sm">
              {L("Our focus is simple: clear information, comfortable vehicles, and predictable private transport from request to arrival.", "تركيزنا بسيط: معلومات واضحة، سيارات مريحة، وتنقل خاص يمكن الاعتماد عليه من لحظة الطلب وحتى الوصول.")}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-8">
          {cards.map((card, index) => (
            <article key={card.title} className={`rounded-2xl border border-lux-charcoal/8 bg-lux-beige/45 p-7 ${index === cards.length - 1 ? "md:col-span-2" : ""}`}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lux-green/12"><card.icon className="h-6 w-6 text-lux-green" /></div>
                <h2 className="text-lux-charcoal" style={{ fontSize: "1.25rem", fontWeight: 800 }}>{card.title}</h2>
              </div>
              <p className="mt-4 text-sm text-neutral-700" style={{ lineHeight: 1.75 }}>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-lux-green py-16" aria-labelledby="about-cta">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <h2 id="about-cta" className="text-white" style={{ fontSize: "clamp(1.65rem,3vw,2.25rem)", fontWeight: 800 }}>{L("Choose your route and see the full price", "اختر مسارك واطّلع على السعر الكامل")}</h2>
          <p className="mt-4 text-white/78">{L("Select your transfer, vehicle and travel details, then send one clear booking request.", "اختر التوصيلة والسيارة وتفاصيل سفرك، ثم أرسل طلب حجز واحداً واضحاً.")}</p>
          <Link to="/booking" className="mt-7 inline-flex rounded-full bg-white px-8 py-3.5 font-semibold text-lux-green transition-all hover:brightness-105">{L("Calculate Your Price", "احسب سعرك")}</Link>
        </div>
      </section>
    </PageShell>
  );
}
