import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { IMAGES, availablePublicTripTypes, findRoute, resolveTripType, tripRulesFor, type Route } from "../components/luxride/data";
import { CLIENT_ACCENT_TEXT, CLIENT_STEP_NUMBER_BG } from "../components/luxride/brand";
import { locationLabel, useLang, useL } from "../components/luxride/i18n";

interface DestinationGroup {
  en: string;
  ar: string;
  routes: Route[];
}

function route(from: string, to: string): Route | null {
  return findRoute(from, to) ?? null;
}

function destinationGroups(): DestinationGroup[] {
  const groups: Array<{ en: string; ar: string; pairs: Array<[string, string]> }> = [
    {
      en: "Airport transfers",
      ar: "توصيلات المطار",
      pairs: [
        ["Hurghada Airport", "Hurghada"],
        ["Hurghada Airport", "Makadi Bay"],
        ["Hurghada Airport", "El Gouna"],
        ["Hurghada Airport", "Sahl Hasheesh"],
        ["Hurghada Airport", "Village Road"],
        ["Hurghada Airport", "Al Ahyaa"],
      ],
    },
    {
      en: "Hurghada area transfers",
      ar: "توصيلات منطقة الغردقة",
      pairs: [
        ["Hurghada", "Hurghada Airport"],
        ["Hurghada", "Village Road"],
        ["Hurghada", "Makadi Bay"],
        ["Hurghada", "El Gouna"],
        ["Hurghada", "Sahl Hasheesh"],
        ["Hurghada", "Soma Bay"],
        ["Hurghada", "Al Ahyaa"],
      ],
    },
    {
      en: "City and long-distance transfers",
      ar: "توصيلات المدن والمسافات الطويلة",
      pairs: [
        ["Hurghada", "Luxor"],
        ["Hurghada", "Cairo"],
        ["Hurghada", "Sharm El Sheikh"],
        ["Hurghada", "Aswan"],
        ["Hurghada", "Alexandria"],
        ["Hurghada", "Marsa Alam"],
        ["Hurghada", "Wadi El Gemal"],
      ],
    },
  ];

  return groups.map((group) => ({
    en: group.en,
    ar: group.ar,
    routes: group.pairs.map(([from, to]) => route(from, to)).filter((item): item is Route => Boolean(item)),
  }));
}

function routeImagePosition(image: string | undefined): string {
  return image === IMAGES.hurghada ? "center 72%" : "center";
}

export function DestinationsPage() {
  const lang = useLang();
  const L = useL();

  return (
    <PageShell
      crumb={L("Destinations", "الوجهات")}
      title={L("Private Transfers Across Egypt", "توصيلات خاصة عبر مصر")}
      subtitle={L("Browse a concise presentation of the most useful LuxRide transfer categories. The calculator still supports the confirmed workbook route map.", "تصفّح عرضاً مختصراً لأهم فئات توصيلات LuxRide. ما زالت الحاسبة تدعم خريطة المسارات المؤكدة من ملف الأسعار.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-14 px-4 md:px-8">
          {destinationGroups().map((group) => (
            <div key={group.en}>
              <h2 className="mb-6 flex items-center gap-3 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 800 }}><span className="h-px w-8 bg-lux-green" /> {L(group.en, group.ar)}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.routes.map((routeItem) => {
                  const publicTrip = availablePublicTripTypes(routeItem)[0];
                  const trip = resolveTripType(routeItem, publicTrip);
                  const price = trip ? routeItem.prices[trip] : undefined;
                  const classification = tripRulesFor(routeItem)?.roundTripMode;
                  const classificationLabel = classification === "overday" ? L("Same-day return", "عودة في نفس اليوم") : classification === "overnight" ? L("Overnight", "مبيت") : "";
                  const query = new URLSearchParams({ from: routeItem.from, to: routeItem.to, trip: publicTrip }).toString();
                  const image = routeItem.image ?? IMAGES.hurghada;
                  return (
                    <article key={routeItem.id} className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                      <div className="relative h-44 overflow-hidden bg-white">
                        <ImageWithFallback loading="lazy" src={image} alt={`${locationLabel(lang, routeItem.from)} — ${locationLabel(lang, routeItem.to)}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: routeImagePosition(image) }} />
                        <span className="absolute right-4 top-4 rounded-full bg-lux-green px-3 py-1 text-xs text-white">{L("from", "من")} €{price}</span>
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-wider text-lux-bronze">{locationLabel(lang, routeItem.from)}</p>
                        <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.2rem", fontWeight: 800 }}>{locationLabel(lang, routeItem.to)}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-lux-green" /> {routeItem.duration}</span>
                          {routeItem.airport && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs text-lux-green">+€2 {L("airport fee", "رسوم مطار")}</span>}
                          {routeItem.permit && <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG, color: CLIENT_ACCENT_TEXT }}>+ {L("travel permit", "تصريح سفر")}</span>}
                          {classificationLabel && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs font-medium text-lux-green">{L("Round Trip", "ذهاب وعودة")} · {classificationLabel}</span>}
                        </div>
                        <div className="mt-5 flex gap-3">
                          <Link to={`/booking?${query}`} className="flex flex-1 items-center justify-center rounded-full bg-lux-green py-2.5 text-sm text-white transition-all hover:brightness-110">{L("Book Now", "احجز الآن")}</Link>
                          <Link to={`/transfer-details?${query}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-lux-charcoal/15 py-2.5 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green">{L("View Transfer", "عرض التوصيلة")} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
