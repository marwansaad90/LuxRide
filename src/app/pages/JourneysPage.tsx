import { PageShell } from "../components/luxride/PageShell";
import { JourneyCard } from "../components/luxride/FeaturedJourneys";
import { useExperiences } from "../components/luxride/cms";
import { useLang, useL } from "../components/luxride/i18n";

export function JourneysPage() {
  const lang = useLang();
  const L = useL();
  const transfers = useExperiences();

  return (
    <PageShell
      crumb={L("Unforgettable Experiences", "تجارب لا تُنسى")}
      title={L("Unforgettable Experiences", "تجارب لا تُنسى")}
      subtitle={L("Browse selected LuxRide transfer experiences, then book a similar private transfer with valid route details already prepared.", "تصفّح تجارب توصيلات LuxRide المختارة، ثم احجز توصيلة خاصة مشابهة مع تجهيز تفاصيل المسار الصحيحة مسبقاً.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-lux-charcoal">
              {lang === "AR" ? "استكشف المزيد من التجارب" : "Explore more experiences"}
            </p>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-lux-green shadow-sm">
              {transfers.length} {lang === "AR" ? "تجارب" : "experiences"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-experiences-page-feed="expanded">
            {transfers.map((journey) => (
              <div key={journey.id} className="min-w-0">
                <JourneyCard journey={journey} layout="expanded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
