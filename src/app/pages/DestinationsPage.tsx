import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { IMAGES, availablePublicTripTypes, findRoute, resolveTripType, type Route } from "../components/luxride/data";
import { useDestinationGroups, type CmsDestination } from "../components/luxride/cms";
import { CLIENT_ACCENT_TEXT, CLIENT_STEP_NUMBER_BG } from "../components/luxride/brand";
import { locationLabel, useLang, useL } from "../components/luxride/i18n";

type DestinationRoute = Route & Pick<CmsDestination, "displayFrom" | "displayTo" | "imagePosition">;

function cmsDestinationRoute(destination: CmsDestination): DestinationRoute | null {
  const baseRoute = findRoute(destination.from, destination.to);
  if (!baseRoute) return null;
  return {
    ...baseRoute,
    image: destination.image || baseRoute.image,
    displayFrom: destination.displayFrom,
    displayTo: destination.displayTo,
    imagePosition: destination.imagePosition,
  };
}

function routeImagePosition(routeItem: DestinationRoute, image: string): string {
  if (routeItem.imagePosition) return routeItem.imagePosition;
  if (image === IMAGES.airport) return "center 42%";
  if (image === IMAGES.villageRoad) return "center 62%";
  if (image === IMAGES.makadi) return "center 58%";
  if (image === IMAGES.elGouna) return "center 60%";
  if (image === IMAGES.sahlHasheesh) return "center 66%";
  if (image === IMAGES.soma) return "center 56%";
  return "center";
}

export function DestinationsPage() {
  const lang = useLang();
  const L = useL();
  const destinationGroups = useDestinationGroups();

  return (
    <PageShell
      crumb={L("Destinations", "الوجهات")}
      title={L("Private Transfers Across Egypt", "توصيلات خاصة عبر مصر")}
      subtitle={L("Explore private transfers from Hurghada and the Red Sea to popular destinations across Egypt.", "استكشف توصيلات خاصة من الغردقة والبحر الأحمر إلى أشهر الوجهات في مصر.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-14 px-4 md:px-8">
          {destinationGroups.map((group) => (
            <div key={group.en}>
              <h2 className="mb-6 flex items-center gap-3 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 800 }}><span className="h-px w-8 bg-lux-green" /> {L(group.en, group.ar)}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.routes.map((destination) => {
                  const routeItem = cmsDestinationRoute(destination);
                  if (!routeItem) return null;
                  const publicTrip = availablePublicTripTypes(routeItem)[0];
                  const trip = resolveTripType(routeItem, publicTrip);
                  const price = trip ? routeItem.prices[trip] : undefined;
                  const showRecommendationBadge = group.en !== "Airport transfers" && group.en !== "Hurghada area transfers";
                  const query = new URLSearchParams({ from: routeItem.from, to: routeItem.to, trip: publicTrip }).toString();
                  const image = routeItem.image ?? IMAGES.hurghada;
                  const fromLabel = routeItem.displayFrom?.[lang] ?? locationLabel(lang, routeItem.from);
                  const toLabel = routeItem.displayTo?.[lang] ?? locationLabel(lang, routeItem.to);
                  return (
                    <article key={routeItem.id} className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                      <div className="relative h-44 overflow-hidden bg-white">
                        <ImageWithFallback loading="lazy" src={image} alt={`${fromLabel} — ${toLabel}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: routeImagePosition(routeItem, image) }} />
                        <span className="absolute right-4 top-4 rounded-full bg-lux-green px-3 py-1 text-xs text-white">{L("from", "من")} €{price}</span>
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-wider text-lux-bronze">{fromLabel}</p>
                        <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.2rem", fontWeight: 800 }}>{toLabel}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-lux-green" /> {routeItem.duration}</span>
                          {routeItem.airport && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs text-lux-green">+€2 {L("airport fee", "رسوم مطار")}</span>}
                          {routeItem.permit && <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG, color: CLIENT_ACCENT_TEXT }}>+ {L("travel permit", "تصريح سفر")}</span>}
                          {showRecommendationBadge && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs font-medium text-lux-green">{L("Recommended: Round Trip", "موصى به: ذهاب وعودة")}</span>}
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
