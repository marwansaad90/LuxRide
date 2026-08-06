import { useMemo, useState } from "react";
import type { PublicTripType } from "../components/luxride/data";
import { PageShell } from "../components/luxride/PageShell";
import { JourneyCard } from "../components/luxride/FeaturedJourneys";
import { FEATURED_JOURNEYS } from "../components/luxride/journeys";
import { useLang, useL } from "../components/luxride/i18n";

type JourneyFilter = "all" | PublicTripType;

export function JourneysPage() {
  const lang = useLang();
  const L = useL();
  const [filter, setFilter] = useState<JourneyFilter>("all");
  const filteredJourneys = useMemo(
    () => FEATURED_JOURNEYS.filter((journey) => filter === "all" || journey.booking.trip === filter),
    [filter],
  );
  const filters: Array<{ id: JourneyFilter; label: string }> = [
    { id: "all", label: L("All journeys", "كل الرحلات") },
    { id: "oneWay", label: L("One Way", "ذهاب فقط") },
    { id: "roundTrip", label: L("Round Trip", "ذهاب وعودة") },
  ];

  return (
    <PageShell
      crumb={L("Journeys", "الرحلات")}
      title={L("Featured Journeys", "رحلات وتوصيلات مختارة")}
      subtitle={L("Browse selected LuxRide journey ideas and book a similar private transfer with valid route details already prepared.", "تصفّح أفكار رحلات مختارة من LuxRide واحجز توصيلة خاصة مشابهة مع تجهيز تفاصيل المسار الصحيحة مسبقاً.")}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  filter === item.id
                    ? "border-lux-green bg-lux-green text-white"
                    : "border-lux-charcoal/10 bg-white text-lux-charcoal hover:border-lux-green hover:text-lux-green"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {filteredJourneys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            {lang === "AR" ? "يمكن إضافة المزيد من الرحلات المختارة بعد اعتماد الصور والمحتوى النهائي." : "More selected journeys can be added once final images and content are approved."}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
