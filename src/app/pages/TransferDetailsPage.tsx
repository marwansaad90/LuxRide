import { Check, Clock, MapPin, PlaneLanding, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { FLEET, IMAGES, PERMIT_FEE, availablePublicTripTypes, findRoute, resolveTripType, tripRulesFor } from "../components/luxride/data";
import { formatEur } from "../components/luxride/bookingState";
import { locationLabel, useL, useLang } from "../components/luxride/i18n";

const TRIP_LABELS = {
  oneWay: ["One Way", "ذهاب فقط"],
  roundTrip: ["Round Trip", "ذهاب وعودة"],
} as const;

export function TransferDetailsPage() {
  const L = useL();
  const lang = useLang();
  const [params] = useSearchParams();
  const route = findRoute(params.get("from") ?? "", params.get("to") ?? "") ?? findRoute("Hurghada", "Luxor")!;
  const xpander = FLEET[0];
  const fromLabel = locationLabel(lang, route.from);
  const toLabel = locationLabel(lang, route.to);
  const routeRules = tripRulesFor(route);
  const priceRows = availablePublicTripTypes(route).map((publicTrip) => {
    const trip = resolveTripType(route, publicTrip)!;
    const classification =
      publicTrip === "roundTrip" && routeRules?.roundTripMode === "overday"
        ? L("Route classification: Overday", "تصنيف المسار: جولة يوم كامل")
        : publicTrip === "roundTrip" && routeRules?.roundTripMode === "overnight"
        ? L("Route classification: Overnight", "تصنيف المسار: مبيت")
        : "";
    return {
      trip: publicTrip,
      label: L(TRIP_LABELS[publicTrip][0], TRIP_LABELS[publicTrip][1]),
      classification,
      base: route.prices[trip]!,
    };
  });
  const startingPrice = Math.min(...priceRows.map((row) => row.base));
  const bookingQuery = new URLSearchParams({ from: route.from, to: route.to, trip: priceRows[0].trip }).toString();

  return (
    <PageShell
      crumb={L("Transfer Details", "تفاصيل التوصيلة")}
      title={L(`${route.from} → ${route.to} Private Transfer`, `توصيلة خاصة: ${fromLabel} ← ${toLabel}`)}
      subtitle={L(
        `A comfortable private transfer from ${route.from} to ${route.to}, with every applicable fee shown before you send the request.`,
        `توصيلة خاصة مريحة من ${fromLabel} إلى ${toLabel}، مع عرض كل الرسوم المطبقة قبل إرسال الطلب.`,
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:px-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-3xl">
              <ImageWithFallback src={route.image ?? IMAGES.hurghada} alt={toLabel} className="h-72 w-full object-cover md:h-96" />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-neutral-600">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-lux-green" /> {L(`Approx. ${route.duration}`, `حوالي ${route.duration}`)}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-lux-green" /> {fromLabel} — {toLabel}</span>
            </div>

            <h2 className="mt-8 text-lux-charcoal" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("About this transfer", "عن هذه التوصيلة")}</h2>
            <p className="mt-3 text-neutral-600" style={{ lineHeight: 1.7 }}>
              {L(
                `Travel in a private, air-conditioned ${xpander.name} with a professional English-speaking driver. Bottled water, WiFi, and front and rear USB Type-A/C charging are included.`,
                `تنقّل في سيارة ${xpander.name} خاصة ومكيفة مع سائق محترف يتحدث الإنجليزية. تشمل التوصيلة مياه معبأة وواي فاي وشحن USB نوع A/C أمامياً وخلفياً.`,
              )}
            </p>

            {route.permit && (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-lux-orange/40 bg-lux-orange/10 p-4 text-sm text-lux-charcoal">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-lux-orange" />
                <span>{L(
                  "This transfer requires an official tourism and security travel permit. A permit fee applies once per booking: €20 for Sedan/MPV, €30 for Minivan.",
                  "تتطلب هذه التوصيلة تصريح سفر سياحي وأمني رسمي. تُطبّق رسوم تصريح مرة واحدة لكل حجز: €20 للسيدان/MPV و€30 للميني فان.",
                )}</span>
              </div>
            )}

            <h2 className="mt-10 text-lux-charcoal" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("Fixed prices (EUR)", "الأسعار الثابتة (يورو)")}</h2>
            <div className="mt-4 overflow-hidden rounded-2xl border border-lux-charcoal/10 bg-white">
              {priceRows.map((row, index) => (
                <div key={row.trip} className={`flex items-center justify-between gap-4 p-5 ${index > 0 ? "border-t border-lux-charcoal/10" : ""}`}>
                  <div>
                    <p className="text-lux-charcoal">{row.label}</p>
                    {row.classification && <p className="text-sm font-medium text-lux-green">{row.classification}</p>}
                    <p className="text-sm text-neutral-500">{L("Route-specific fixed base price", "سعر أساسي ثابت خاص بالمسار")}</p>
                  </div>
                  <p className="text-lux-green" style={{ fontSize: "1.75rem", fontWeight: 700 }}>{formatEur(row.base)}</p>
                </div>
              ))}
              <div className="border-t border-lux-charcoal/10 bg-lux-beige/40 p-5 text-sm text-neutral-500">
                {route.airport && <>+ {L("Airport operating surcharge", "رسوم تشغيل المطار")} €2 · </>}
                {route.permit && <>+ {L("Travel permit", "تصريح السفر")} €{PERMIT_FEE.mpv} (MPV) · </>}
                {L("Round Trip uses the approved fixed route price shown before booking.", "تستخدم الذهاب والعودة السعر الثابت المعتمد للمسار والمعروض قبل الحجز.")}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-lux-green/30 bg-white p-6 text-lux-charcoal shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
              <p className="text-xs uppercase tracking-widest text-neutral-500">{L("From", "يبدأ من")}</p>
              <p className="text-lux-green" style={{ fontSize: "2.75rem", fontWeight: 700, lineHeight: 1 }}>{formatEur(startingPrice)}</p>
              <p className="mt-1 text-sm text-neutral-500">{L("per private vehicle", "لكل سيارة خاصة")}</p>
              <img src={xpander.image} alt={xpander.name} className="mt-4 h-32 w-full object-contain" style={{ direction: "ltr" }} />
              <ul className="mt-5 space-y-2 text-sm text-neutral-600">
                {[L("Private air-conditioned vehicle", "سيارة خاصة مكيفة"), L("Professional English-speaking driver", "سائق محترف يتحدث الإنجليزية"), L("Bottled water, WiFi & USB charging", "مياه وواي فاي وشحن USB"), L("Fixed transparent price", "سعر ثابت وشفاف")].map((feature) => (
                  <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 text-lux-green" /> {feature}</li>
                ))}
              </ul>
              <Link to={`/booking?${bookingQuery}`} className="mt-6 flex w-full items-center justify-center rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110">
                {L("Book This Transfer", "احجز هذه التوصيلة")}
              </Link>
              {route.airport && <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500"><PlaneLanding className="h-3.5 w-3.5 text-lux-green" /> {L("Airport arrivals include flight monitoring", "وصول المطار يشمل متابعة الرحلة")}</p>}
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
