import { Check, PackageCheck, Snowflake, Usb, Users, Wifi, X } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { isVehicleSelectable } from "../components/luxride/data";
import { useVehicles } from "../components/luxride/cms";
import { useLang, useL } from "../components/luxride/i18n";
import { CLIENT_ACCENT_TEXT, CLIENT_ACCENT_YELLOW } from "../components/luxride/brand";

export function FleetPage() {
  const lang = useLang();
  const L = useL();
  const vehicles = useVehicles();
  const chargingText = (id: string) =>
    id === "hiace"
      ? L("USB charging available in the front cabin", "منافذ شحن USB متوفرة في المقصورة الأمامية")
      : L("USB Type-A/C charging", "شحن USB نوع A/C");

  return (
    <PageShell
      crumb={L("Fleet", "الأسطول")}
      title={L("Our Fleet", "أسطولنا")}
      subtitle={L(
        "Choose the modern vehicle that best fits your group and luggage.",
        "اختر السيارة الحديثة التي تناسب مجموعتك وأمتعتك.",
      )}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div dir={lang === "AR" ? "rtl" : "ltr"} className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-3">
          {vehicles.map((v) => (
            <div
              key={v.id}
              dir={lang === "AR" ? "rtl" : "ltr"}
              className={`flex min-h-[40rem] flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] ${
                isVehicleSelectable(v) ? "border-lux-green/30" : "border-neutral-200 opacity-70"
              }`}
            >
              <div className="relative h-52 overflow-hidden bg-white">
                <ImageWithFallback
                  src={v.image}
                  alt={v.name}
                  className="h-full w-full object-contain p-4"
                  style={{ direction: "ltr" }}
                />
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs ${isVehicleSelectable(v) ? "bg-lux-green text-white" : "bg-lux-charcoal/90 text-lux-beige/80"}`}>
                  {isVehicleSelectable(v) ? L("Available", "متاح") : L("Coming Soon", "قريباً")}
                </span>
                <span className="absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT }} data-fleet-type-badge="client-accent">{L(v.category, v.categoryAr)}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.35rem" }}>{v.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{L(v.tagline, v.taglineAr)}</p>

                <ul className="mt-5 space-y-3 text-sm text-neutral-600">
                  <li className="flex items-center gap-3"><Users className="h-4 w-4 text-lux-green" /> {L(v.capacityEn, v.capacityAr)}</li>
                  <li className="flex items-center gap-3"><Snowflake className="h-4 w-4 text-lux-green" /> {L("Air conditioning", "تكييف هواء")}</li>
                  <li className="flex items-center gap-3"><Usb className="h-4 w-4 text-lux-green" /> {chargingText(v.id)}</li>
                  <li className="flex items-center gap-3">
                    {v.wifi ? <Wifi className="h-4 w-4 text-lux-green" /> : <X className="h-4 w-4 text-neutral-300" />}
                    {v.wifi ? L("WiFi on board", "واي فاي متوفر") : L("WiFi not available", "الواي فاي غير متوفر")}
                  </li>
                  <li className="flex items-center gap-3"><PackageCheck className="h-4 w-4 text-lux-green" /> {L("Ice Box / Chilled Drinks Box", "صندوق حفظ المشروبات")}</li>
                </ul>

                <div className="mt-auto pt-6">
                  {isVehicleSelectable(v) ? (
                    <Link to={`/booking?vehicle=${v.id}`} className="flex w-full items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110">
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
