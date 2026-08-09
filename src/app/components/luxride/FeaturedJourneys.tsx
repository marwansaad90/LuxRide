import { ArrowRight, ChevronLeft, ChevronRight, Images, MapPinned } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { journeyBookingQuery, newestFeaturedTransfers, type FeaturedTransfer } from "./journeys";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";

export function JourneyCard({ journey, compact = false }: { journey: FeaturedTransfer; compact?: boolean }) {
  const lang = useLang();
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = journey.images[imageIndex] ?? journey.images[0];
  const canNavigate = journey.images.length > 1;
  const description = compact ? journey.excerpt[lang] : journey.description[lang];

  function moveImage(step: number) {
    setImageIndex((index) => (index + step + journey.images.length) % journey.images.length);
  }

  return (
    <article className="group flex h-[560px] min-w-[20rem] max-w-[20rem] flex-col overflow-hidden rounded-2xl border border-lux-charcoal/8 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)] sm:min-w-[23rem] sm:max-w-[23rem] lg:min-w-[25rem] lg:max-w-[25rem]">
      <div className="relative h-56 shrink-0 overflow-hidden bg-lux-beige" data-featured-transfer-gallery="true">
        <ImageWithFallback src={currentImage} alt={journey.title[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-[#CC9966] px-3 py-1 text-xs font-bold text-white shadow-md">
          {journey.routeType[lang]}
        </span>
        {canNavigate && (
          <>
            <button type="button" onClick={() => moveImage(-1)} aria-label={lang === "AR" ? "الصورة السابقة" : "Previous image"} className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lux-charcoal shadow transition hover:bg-white">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            </button>
            <button type="button" onClick={() => moveImage(1)} aria-label={lang === "AR" ? "الصورة التالية" : "Next image"} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lux-charcoal shadow transition hover:bg-white">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </>
        )}
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-lux-charcoal backdrop-blur">
          <Images className="h-3.5 w-3.5 text-[#CC9966]" />
          {imageIndex + 1}/{journey.images.length}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lux-bronze">
          <MapPinned className="h-3.5 w-3.5" />
          {journey.vehicle[lang]}
        </p>
        <h3 className="mt-2 text-lux-charcoal" style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.2 }}>
          {journey.title[lang]}
        </h3>
        <div className="mt-3 max-h-32 whitespace-pre-line overflow-y-auto pr-2 text-sm text-neutral-500 [scrollbar-width:thin]" style={{ lineHeight: 1.65 }} data-experience-description="scrollable">
          {description}
        </div>
        <Link to={`/booking?${journeyBookingQuery(journey)}`} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-lux-green py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110">
          {lang === "AR" ? "احجز توصيلة مشابهة" : "Book Similar Transfer"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}

export function FeaturedJourneys() {
  const lang = useLang();
  const transfers = useMemo(() => newestFeaturedTransfers(), []);

  return (
    <section id="experiences" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={lang === "AR" ? "تجارب مختارة" : "Selected Experiences"}
          title={lang === "AR" ? "تجارب لا تُنسى" : "Unforgettable Experiences"}
          subtitle={lang === "AR" ? "نماذج من تجارب توصيلة حقيقية تساعدك على اختيار الخدمة المناسبة بثقة." : "Selected real transfer experiences to help you choose the right private service with confidence."}
        />
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-white to-transparent md:block" />
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:thin]" data-experiences-feed="horizontal">
            {transfers.map((journey) => (
              <div key={journey.id} className="snap-start">
                <JourneyCard journey={journey} compact />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link to="/experiences" className="inline-flex items-center justify-center gap-2 rounded-full border border-lux-green/35 px-8 py-3 text-sm font-semibold text-lux-green transition-all hover:bg-lux-green hover:text-white">
            {lang === "AR" ? "استعرض كل التجارب" : "Explore All Experiences"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
