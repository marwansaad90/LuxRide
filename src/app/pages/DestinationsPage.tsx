import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { IMAGES } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

interface Dest {
  en: string;
  ar: string;
  from: number;
  duration: string;
  image: string;
  permit?: boolean;
  airport?: boolean;
}

interface Group {
  en: string;
  ar: string;
  items: Dest[];
}

const GROUPS: Group[] = [
  {
    en: "Hurghada & nearby resorts",
    ar: "الغردقة والمنتجعات القريبة",
    items: [
      { en: "Hurghada Airport", ar: "مطار الغردقة", from: 10, duration: "20 min", image: IMAGES.hurghada, airport: true },
      { en: "Hurghada", ar: "الغردقة", from: 10, duration: "20 min", image: IMAGES.hurghada, airport: true },
      { en: "El Gouna", ar: "الجونة", from: 13, duration: "35 min", image: IMAGES.elGouna, airport: true },
      { en: "Sahl Hasheesh", ar: "سهل حشيش", from: 13, duration: "30 min", image: IMAGES.hurghada, airport: true },
      { en: "Makadi Bay", ar: "مكادي باي", from: 14, duration: "40 min", image: IMAGES.makadi, airport: true },
      { en: "Soma Bay", ar: "سوما باي", from: 13, duration: "50 min", image: IMAGES.soma, airport: true },
      { en: "Safaga", ar: "سفاجا", from: 18, duration: "1 h", image: IMAGES.soma, airport: true },
      { en: "Sharm El Naga", ar: "شرم النجع", from: 35, duration: "half day", image: IMAGES.soma },
    ],
  },
  {
    en: "Marsa Alam region",
    ar: "منطقة مرسى علم",
    items: [
      { en: "El Quseir", ar: "القصير", from: 38, duration: "2 h", image: IMAGES.marsaAlam, airport: true },
      { en: "Nefertari", ar: "نفرتاري", from: 28, duration: "1 h 20 min", image: IMAGES.marsaAlam, airport: true },
      { en: "Marsa Ghaleb", ar: "مرسى غالب", from: 58, duration: "2 h 30 min", image: IMAGES.marsaAlam, airport: true },
      { en: "Marsa Alam", ar: "مرسى علم", from: 65, duration: "3 h", image: IMAGES.marsaAlam, airport: true },
      { en: "Hamata", ar: "حماطة", from: 90, duration: "4 h", image: IMAGES.marsaAlam, airport: true },
    ],
  },
  {
    en: "Historical destinations",
    ar: "الوجهات التاريخية",
    items: [
      { en: "Luxor", ar: "الأقصر", from: 75, duration: "4 h", image: IMAGES.luxor, permit: true },
      { en: "Aswan", ar: "أسوان", from: 110, duration: "7 h", image: IMAGES.luxor, permit: true },
    ],
  },
  {
    en: "Cairo, Giza & Alexandria",
    ar: "القاهرة والجيزة والإسكندرية",
    items: [
      { en: "Cairo & Giza", ar: "القاهرة والجيزة", from: 110, duration: "5 h 30 min", image: IMAGES.luxor, permit: true },
      { en: "Alexandria", ar: "الإسكندرية", from: 180, duration: "8 h", image: IMAGES.luxor },
      { en: "Zaafarana", ar: "الزعفرانة", from: 90, duration: "3 h", image: IMAGES.hurghada },
    ],
  },
  {
    en: "Sharm El Sheikh region",
    ar: "منطقة شرم الشيخ",
    items: [
      { en: "Sharm El Sheikh", ar: "شرم الشيخ", from: 200, duration: "6 h", image: IMAGES.soma, permit: true },
    ],
  },
];

export function DestinationsPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Destinations", "الوجهات")}
      title={L("Private Transfers Across Egypt", "رحلات خاصة عبر مصر")}
      subtitle={L(
        "Fixed, transparent starting prices in EUR for every destination we serve. Airport and travel-permit fees, where applicable, are shown clearly before you confirm.",
        "أسعار بداية ثابتة وشفافة باليورو لكل وجهة نخدمها. تُعرض رسوم المطار وتصريح السفر عند الحاجة بوضوح قبل التأكيد.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-14 px-4 md:px-8">
          {GROUPS.map((g) => (
            <div key={g.en}>
              <h2 className="mb-6 flex items-center gap-3 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
                <span className="h-px w-8 bg-lux-green" /> {L(g.en, g.ar)}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((d) => (
                  <div key={d.en} className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                    <div className="relative h-44 overflow-hidden">
                      <ImageWithFallback src={d.image} alt={L(d.en, d.ar)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute right-4 top-4 rounded-full bg-lux-green px-3 py-1 text-xs text-white">{L("from", "من")} €{d.from}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lux-charcoal" style={{ fontSize: "1.2rem" }}>{L(d.en, d.ar)}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-lux-green" /> {d.duration}</span>
                        {d.airport && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs text-lux-green">+€2 {L("airport fee", "رسوم مطار")}</span>}
                        {d.permit && <span className="rounded-full bg-lux-orange/10 px-2 py-0.5 text-xs text-lux-bronze">+ {L("travel permit", "تصريح سفر")}</span>}
                      </div>
                      <div className="mt-5 flex gap-3">
                        <Link to="/booking" className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-lux-green py-2.5 text-sm text-white transition-all hover:brightness-110">
                          {L("Book Now", "احجز الآن")}
                        </Link>
                        <Link to="/transfer-details" className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-lux-charcoal/15 py-2.5 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green">
                          {L("View Transfer", "عرض الرحلة")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
