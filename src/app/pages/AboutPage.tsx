import { BadgeCheck, Clock, MapPin, PlaneLanding, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ServiceBenefits, FinalCTA } from "../components/luxride/Sections";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { IMAGES } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

export function AboutPage() {
  const L = useL();

  const stats = [
    { value: L("Airport", "المطار"), label: L("Flight-monitored transfers", "رحلات مع متابعة الطيران") },
    { value: L("Hotels", "الفنادق"), label: L("Door-to-door private service", "خدمة خاصة من الباب إلى الباب") },
    { value: L("Red Sea", "البحر الأحمر"), label: L("Resort destination network", "شبكة وجهات المنتجعات") },
    { value: L("Intercity", "بين المدن"), label: L("Long-distance private trips", "رحلات خاصة بعيدة المسافة") },
  ];

  const pillars = [
    { icon: ShieldCheck, t: L("Safety & official compliance", "السلامة والامتثال الرسمي"), d: L("Licensed vehicles and drivers operating in full compliance with Egyptian tourism transport regulations.", "سيارات وسائقون مرخصون يعملون بالامتثال الكامل للوائح النقل السياحي المصرية.") },
    { icon: BadgeCheck, t: L("Professional English-speaking drivers", "سائقون محترفون يتحدثون الإنجليزية"), d: L("Experienced, courteous chauffeurs who know the roads and put guests at ease.", "سائقون ذوو خبرة وأخلاق رفيعة يعرفون الطرق ويمنحون الضيوف الطمأنينة.") },
    { icon: Wallet, t: L("Fixed & transparent prices", "أسعار ثابتة وشفافة"), d: L("Every fare is fixed in EUR and shown in full before you confirm — no hidden charges.", "كل سعر ثابت باليورو ويُعرض بالكامل قبل التأكيد — بدون رسوم خفية.") },
    { icon: PlaneLanding, t: L("Live flight tracking", "متابعة الرحلات الجوية مباشرة"), d: L("We monitor arrivals in real time and adjust your pickup for delays or early landings.", "نتابع الوصول في الوقت الفعلي ونعدّل الاستلام عند التأخير أو الهبوط المبكر.") },
  ];

  return (
    <PageShell
      crumb={L("About Us", "من نحن")}
      title={L("About LuxRide", "عن LuxRide")}
      subtitle={L(
        "Your premier choice for reliable, luxury, and hassle-free private transfers across Egypt's Red Sea coast and top historical destinations.",
        "خيارك الأول لخدمات نقل خاصة موثوقة وفاخرة وخالية من المتاعب عبر ساحل البحر الأحمر المصري وأبرز الوجهات التاريخية.",
      )}
    >
      {/* Intro + image */}
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl">
            <ImageWithFallback src={IMAGES.driver} alt="LuxRide chauffeur" className="h-[420px] w-full object-cover" />
          </div>
          <div>
            <h2 className="text-lux-charcoal" style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 700 }}>
              {L("A better way to travel in Egypt", "طريقة أفضل للسفر في مصر")}
            </h2>
            <p className="mt-5 text-neutral-600" style={{ lineHeight: 1.7 }}>
              {L(
                "LuxRide provides airport transfers, private transportation, hotel transfers, long-distance journeys, overday and overnight trips, and historical and cultural tours across Hurghada, the Red Sea resorts, and Egypt's iconic destinations.",
                "توفّر LuxRide تحويلات المطار، والنقل الخاص، وتحويلات الفنادق، والرحلات بعيدة المسافة، ورحلات اليوم والمبيت، والجولات التاريخية والثقافية عبر الغردقة ومنتجعات البحر الأحمر وأشهر وجهات مصر.",
              )}
            </p>
            <p className="mt-4 text-neutral-600" style={{ lineHeight: 1.7 }}>
              {L(
                "Our mission is simple: make every journey safe, comfortable and completely predictable — from the moment you land to the moment you arrive.",
                "مهمتنا بسيطة: جعل كل رحلة آمنة ومريحة ومتوقعة تماماً — من لحظة هبوطك حتى لحظة وصولك.",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-lux-dark py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:px-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-lux-green/20 bg-lux-dark-2 p-6 text-center">
              <p className="text-lux-green" style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p className="mt-2 text-sm text-lux-beige/70">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.t} className="flex gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lux-green/12">
                  <p.icon className="h-6 w-6 text-lux-green" />
                </div>
                <div>
                  <h3 className="text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{p.t}</h3>
                  <p className="mt-2 text-sm text-neutral-500" style={{ lineHeight: 1.6 }}>{p.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
              <MapPin className="h-6 w-6 text-lux-green" />
              <h3 className="mt-3 text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{L("Red Sea destination network", "شبكة وجهات البحر الأحمر")}</h3>
              <p className="mt-2 text-sm text-neutral-500">{L("Hurghada, El Gouna, Sahl Hasheesh, Makadi Bay, Soma Bay, Safaga, Marsa Alam and beyond.", "الغردقة، الجونة، سهل حشيش، مكادي باي، سوما باي، سفاجا، مرسى علم وأبعد.")}</p>
            </div>
            <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
              <Clock className="h-6 w-6 text-lux-green" />
              <h3 className="mt-3 text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{L("Historical & intercity network", "الشبكة التاريخية وبين المدن")}</h3>
              <p className="mt-2 text-sm text-neutral-500">{L("Luxor, Aswan, Cairo & Giza, Alexandria and Sharm El Sheikh with official travel permits arranged.", "الأقصر، أسوان، القاهرة والجيزة، الإسكندرية وشرم الشيخ مع ترتيب تصاريح السفر الرسمية.")}</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/booking" className="inline-block rounded-full bg-lux-green px-8 py-3.5 text-white transition-all hover:brightness-110">
              {L("Calculate Your Price", "احسب سعرك")}
            </Link>
          </div>
        </div>
      </section>

      <ServiceBenefits />
      <FinalCTA />
    </PageShell>
  );
}
