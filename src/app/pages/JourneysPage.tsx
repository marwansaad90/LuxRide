import { useMemo } from "react";
import { PageShell } from "../components/luxride/PageShell";
import { JourneyCard } from "../components/luxride/FeaturedJourneys";
import { newestFeaturedTransfers } from "../components/luxride/journeys";
import { useLang, useL } from "../components/luxride/i18n";

export function JourneysPage() {
  const lang = useLang();
  const L = useL();
  const transfers = useMemo(() => newestFeaturedTransfers(), []);

  return (
    <PageShell
      crumb={L("Featured Transfers", "توصيلات مميزة")}
      title={L("Featured Transfers", "توصيلات مميزة")}
      subtitle={L("Browse selected LuxRide transfer examples in newest-first order, then book a similar private transfer with valid route details already prepared.", "تصفّح نماذج توصيلات LuxRide المختارة من الأحدث إلى الأقدم، ثم احجز توصيلة خاصة مشابهة مع تجهيز تفاصيل المسار الصحيحة مسبقاً.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-lux-charcoal">
              {lang === "AR" ? "اسحب أفقياً لمشاهدة التوصيلات الأقدم" : "Scroll horizontally to see older transfers"}
            </p>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-lux-green shadow-sm">
              {transfers.length} {lang === "AR" ? "توصيلات" : "transfers"}
            </span>
          </div>
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5 [scrollbar-width:thin]" data-featured-transfers-page-feed="horizontal">
            {transfers.map((journey) => (
              <div key={journey.id} className="snap-start">
                <JourneyCard journey={journey} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            {lang === "AR" ? "يمكن إضافة المزيد من التوصيلات المميزة بعد اعتماد الصور والمحتوى النهائي." : "More featured transfers can be added once final images and content are approved."}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
