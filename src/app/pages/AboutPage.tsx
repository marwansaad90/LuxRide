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
    { icon: Sparkles, title: L("Why Travel with LuxRide", "لماذا تسافر مع LuxRide"), text: L("Every journey is planned as a private, door-to-door service with clear pickup details, comfortable travel and direct support when you need it.", "تُخطط كل رحلة كخدمة خاصة من الباب إلى الباب مع تفاصيل استلام واضحة وسفر مريح ودعم مباشر عند الحاجة.") },
    { icon: CarFront, title: L("Fleet and Comfort", "الأسطول والراحة"), text: L("The modern fleet includes an MPV, sedan and mini van, all air-conditioned and matched to the confirmed passenger and luggage limits shown during booking.", "يشمل الأسطول الحديث سيارة MPV وسيدان وميني فان، وجميعها مكيفة وتطابق حدود الركاب والأمتعة المؤكدة المعروضة أثناء الحجز.") },
    { icon: ShieldCheck, title: L("Safety and Compliance", "السلامة والامتثال"), text: L("LuxRide arranges journeys with licensed vehicles and drivers in line with applicable Egyptian tourism transport and travel-permit requirements.", "ترتّب LuxRide الرحلات بسيارات وسائقين مرخصين وفق متطلبات النقل السياحي وتصاريح السفر المعمول بها في مصر.") },
    { icon: BadgeCheck, title: L("Professional Drivers", "سائقون محترفون"), text: L("Courteous, experienced English-speaking drivers focus on safe driving, punctual pickup and a calm guest experience.", "يركز السائقون المحترفون ذوو الخبرة والمتحدثون بالإنجليزية على القيادة الآمنة والاستلام في الموعد وتجربة مريحة للضيف.") },
    { icon: Wallet, title: L("Transparent Pricing", "أسعار شفافة"), text: L("Approved fares are fixed in EUR and tax inclusive. Applicable airport or permit fees are listed separately before submission, with no hidden charges.", "الأسعار المعتمدة ثابتة باليورو وشاملة الضريبة. تُدرج رسوم المطار أو التصريح المطبقة بشكل منفصل قبل الإرسال، من دون رسوم خفية.") },
    { icon: PlaneLanding, title: L("Flight Monitoring", "متابعة الرحلات"), text: L("For airport arrivals, flight details allow the team to monitor the arrival and adjust pickup timing when a flight is delayed or lands early.", "عند الوصول من المطار، تتيح تفاصيل الرحلة للفريق متابعة الوصول وتعديل موعد الاستلام عند تأخر الرحلة أو هبوطها مبكراً.") },
    { icon: MapPin, title: L("Destination Network", "شبكة الوجهات"), text: L("LuxRide serves Hurghada and Red Sea resorts, airport and hotel transfers, and long-distance or historical journeys to destinations including Luxor, Aswan, Cairo and Sharm El Sheikh.", "تخدم LuxRide الغردقة ومنتجعات البحر الأحمر، وتحويلات المطار والفنادق، والرحلات بعيدة المسافة أو التاريخية إلى وجهات تشمل الأقصر وأسوان والقاهرة وشرم الشيخ.") },
  ];

  return (
    <PageShell
      crumb={L("About Us", "من نحن")}
      title={L("About LuxRide", "عن LuxRide")}
      subtitle={L("Premium private transportation from Hurghada across the Red Sea coast and Egypt's leading destinations.", "نقل خاص متميز من الغردقة عبر ساحل البحر الأحمر وأبرز وجهات مصر.")}
    >
      <section className="bg-lux-beige py-16 md:py-24" aria-labelledby="about-introduction">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl"><ImageWithFallback loading="lazy" src={IMAGES.driver} alt={L("Professional LuxRide driver", "سائق LuxRide محترف")} className="h-[420px] w-full object-cover" /></div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-lux-bronze">01 · {L("Introduction", "مقدمة")}</p>
            <h2 id="about-introduction" className="mt-2 text-lux-charcoal" style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 700 }}>{L("Premium private transportation", "نقل خاص متميز")}</h2>
            <p className="mt-5 text-neutral-600" style={{ lineHeight: 1.8 }}>{L("LuxRide provides private airport transfers, door-to-door hotel transfers, Red Sea resort transportation, and long-distance historical journeys. Each service is arranged around the guest's confirmed route, timing, group and luggage.", "توفّر LuxRide تحويلات مطار خاصة، ونقلاً من الباب إلى الباب للفنادق، وتنقلاً إلى منتجعات البحر الأحمر، ورحلات تاريخية بعيدة المسافة. تُرتب كل خدمة وفق المسار والموعد والمجموعة والأمتعة المؤكدة للضيف.")}</p>
          </div>
        </div>
      </section>

      <section className="bg-lux-dark py-16" aria-labelledby="about-mission">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-lux-gold">02 · {L("Mission", "المهمة")}</p>
          <h2 id="about-mission" className="mt-3 text-lux-beige" style={{ fontSize: "clamp(1.65rem,3vw,2.25rem)", fontWeight: 700 }}>{L("Safe, comfortable and predictable journeys", "رحلات آمنة ومريحة وواضحة")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lux-beige/70" style={{ lineHeight: 1.8 }}>{L("Our mission is to make private travel easier from the first price estimate through pickup and arrival, with clear information and professional service throughout.", "مهمتنا هي تسهيل السفر الخاص من أول تقدير للسعر وحتى الاستلام والوصول، مع معلومات واضحة وخدمة احترافية طوال الرحلة.")}</p>
        </div>
      </section>

      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 md:px-8">
          {cards.map((card, index) => (
            <article key={card.title} className={`rounded-2xl border border-lux-charcoal/8 bg-white p-7 ${index === cards.length - 1 ? "md:col-span-2" : ""}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lux-green/12"><card.icon className="h-6 w-6 text-lux-green" /></div>
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-lux-bronze">{String(index + 3).padStart(2, "0")}</p>
              <h2 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.25rem", fontWeight: 700 }}>{card.title}</h2>
              <p className="mt-3 text-sm text-neutral-600" style={{ lineHeight: 1.75 }}>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-lux-dark py-16" aria-labelledby="about-cta">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-lux-gold">10 · {L("Plan Your Journey", "خطّط لرحلتك")}</p>
          <h2 id="about-cta" className="mt-3 text-lux-beige" style={{ fontSize: "clamp(1.65rem,3vw,2.25rem)", fontWeight: 700 }}>{L("Choose your route and see the full price", "اختر مسارك واطّلع على السعر الكامل")}</h2>
          <p className="mt-4 text-lux-beige/70">{L("Select your journey, vehicle and travel details, then send one clear booking request.", "اختر رحلتك وسيارتك وتفاصيل سفرك، ثم أرسل طلب حجز واحداً واضحاً.")}</p>
          <Link to="/booking" className="mt-7 inline-flex rounded-full bg-lux-green px-8 py-3.5 text-white transition-all hover:brightness-110">{L("Calculate Your Price", "احسب سعرك")}</Link>
        </div>
      </section>
    </PageShell>
  );
}
