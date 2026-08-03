import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ROUTES, availableTripTypes, type Route } from "../components/luxride/data";
import { locationLabel, useLang, useL } from "../components/luxride/i18n";

function groupRoutes(routes: Route[]) {
  return [
    { en: "Hurghada Airport transfers", ar: "تحويلات مطار الغردقة", routes: routes.filter((route) => route.id.startsWith("a")) },
    { en: "City tours and nearby journeys", ar: "جولات المدينة والرحلات القريبة", routes: routes.filter((route) => route.id.startsWith("c")) },
    { en: "Long-distance and historical journeys", ar: "الرحلات بعيدة المسافة والتاريخية", routes: routes.filter((route) => route.id.startsWith("l")) },
  ];
}

export function DestinationsPage() {
  const lang = useLang();
  const L = useL();

  return (
    <PageShell
      crumb={L("Destinations", "الوجهات")}
      title={L("Private Transfers Across Egypt", "رحلات خاصة عبر مصر")}
      subtitle={L("Browse every currently priced LuxRide route. Applicable airport and travel-permit fees are shown before a booking request is sent.", "تصفّح جميع مسارات LuxRide المسعّرة حالياً. تُعرض رسوم المطار وتصريح السفر المطبقة قبل إرسال طلب الحجز.")}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl space-y-14 px-4 md:px-8">
          {groupRoutes(ROUTES).map((group) => (
            <div key={group.en}>
              <h2 className="mb-6 flex items-center gap-3 text-lux-charcoal" style={{ fontSize: "1.75rem", fontWeight: 700 }}><span className="h-px w-8 bg-lux-green" /> {L(group.en, group.ar)}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.routes.map((route) => {
                  const trip = availableTripTypes(route)[0];
                  const price = route.prices[trip];
                  const query = new URLSearchParams({ from: route.from, to: route.to, trip }).toString();
                  return (
                    <article key={route.id} className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
                      <div className="relative h-44 overflow-hidden">
                        <ImageWithFallback loading="lazy" src={route.image} alt={`${locationLabel(lang, route.from)} — ${locationLabel(lang, route.to)}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute right-4 top-4 rounded-full bg-lux-green px-3 py-1 text-xs text-white">{L("from", "من")} €{price}</span>
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-wider text-lux-bronze">{locationLabel(lang, route.from)}</p>
                        <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.2rem" }}>{locationLabel(lang, route.to)}</h3>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-lux-green" /> {route.duration}</span>
                          {route.airport && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs text-lux-green">+€2 {L("airport fee", "رسوم مطار")}</span>}
                          {route.permit && <span className="rounded-full bg-lux-orange/10 px-2 py-0.5 text-xs text-lux-bronze">+ {L("travel permit", "تصريح سفر")}</span>}
                        </div>
                        <div className="mt-5 flex gap-3">
                          <Link to={`/booking?${query}`} className="flex flex-1 items-center justify-center rounded-full bg-lux-green py-2.5 text-sm text-white transition-all hover:brightness-110">{L("Book Now", "احجز الآن")}</Link>
                          <Link to={`/transfer-details?${query}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-lux-charcoal/15 py-2.5 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green">{L("View Transfer", "عرض الرحلة")} <ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
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
