import { Check, Snowflake, Usb, Users, Wifi, X } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { FLEET } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

export function FleetPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Fleet", "الأسطول")}
      title={L("Our Fleet", "أسطولنا")}
      subtitle={L(
        "Modern, air-conditioned and immaculately maintained vehicles. Only the Mitsubishi Xpander is currently available for booking — additional vehicles are coming soon.",
        "سيارات حديثة ومكيفة ومُصانة بعناية. المتاح للحجز حالياً هو ميتسوبيشي إكسباندر فقط — والمزيد من السيارات قريباً.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-3">
          {FLEET.map((v) => (
            <div
              key={v.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] ${
                v.available ? "border-lux-green/30" : "border-neutral-200 opacity-70"
              }`}
            >
              <div className="relative h-52 overflow-hidden bg-white">
                <ImageWithFallback
                  src={v.image}
                  alt={v.name}
                  className="h-full w-full object-contain p-4"
                  style={{ direction: "ltr" }}
                />
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs ${v.available ? "bg-lux-green text-white" : "bg-lux-charcoal/90 text-lux-beige/80"}`}>
                  {v.available ? L("Available", "متاح") : L("Coming Soon", "قريباً")}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-lux-gold">{L(v.category, v.categoryAr)}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.35rem" }}>{v.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{v.tagline}</p>

                <ul className="mt-5 space-y-3 text-sm text-neutral-600">
                  <li className="flex items-center gap-3"><Users className="h-4 w-4 text-lux-green" /> {L(v.capacityEn, v.capacityAr)}</li>
                  <li className="flex items-center gap-3"><Snowflake className="h-4 w-4 text-lux-green" /> {L("Air conditioning", "تكييف هواء")}</li>
                  <li className="flex items-center gap-3"><Usb className="h-4 w-4 text-lux-green" /> {L("USB Type-A/C charging", "شحن USB نوع A/C")}</li>
                  <li className="flex items-center gap-3">
                    {v.wifi ? <Wifi className="h-4 w-4 text-lux-green" /> : <X className="h-4 w-4 text-neutral-300" />}
                    {v.wifi ? L("WiFi on board", "واي فاي متوفر") : L("WiFi not available", "الواي فاي غير متوفر")}
                  </li>
                </ul>

                <div className="mt-6">
                  {v.available ? (
                    <Link to="/booking" className="flex w-full items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110">
                      <Check className="h-4 w-4" /> {L("Book This Vehicle", "احجز هذه السيارة")}
                    </Link>
                  ) : (
                    <span className="flex w-full cursor-not-allowed items-center justify-center rounded-full border border-neutral-200 py-3 text-sm text-neutral-400">
                      {L("Currently Unavailable", "غير متاح حالياً")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
