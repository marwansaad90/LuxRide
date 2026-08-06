import { ArrowRight, Images, MapPinned } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { FEATURED_JOURNEYS, journeyBookingQuery, type FeaturedJourney } from "./journeys";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";

export function JourneyCard({ journey }: { journey: FeaturedJourney }) {
  const lang = useLang();

  return (
    <article className="group overflow-hidden rounded-2xl border border-lux-charcoal/8 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.12)]">
      <div className="relative h-56 overflow-hidden bg-lux-dark">
        <ImageWithFallback src={journey.image} alt={journey.title[lang]} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-[#CC9966] px-3 py-1 text-xs font-bold text-white shadow-md">
          {journey.routeType[lang]}
        </span>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-lux-charcoal backdrop-blur">
          <Images className="h-3.5 w-3.5 text-[#CC9966]" />
          {journey.galleryCount}
        </span>
      </div>
      <div className="p-6">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-lux-bronze">
          <MapPinned className="h-3.5 w-3.5" />
          {journey.vehicle[lang]}
        </p>
        <h3 className="mt-2 text-lux-charcoal" style={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.2 }}>
          {journey.title[lang]}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm text-neutral-500" style={{ lineHeight: 1.65 }}>
          {journey.description[lang]}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {journey.tags[lang].map((tag) => (
            <span key={tag} className="rounded-full bg-lux-green/10 px-2.5 py-1 text-xs font-medium text-lux-green">
              {tag}
            </span>
          ))}
        </div>
        <Link to={`/booking?${journeyBookingQuery(journey)}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-lux-green py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110">
          {lang === "AR" ? "احجز رحلة مشابهة" : "Book Similar Trip"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}

export function FeaturedJourneys() {
  const lang = useLang();

  return (
    <section id="featured-journeys" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={lang === "AR" ? "رحلات مختارة" : "Featured Routes"}
          title={lang === "AR" ? "رحلات وتوصيلات مختارة" : "Featured Journeys"}
          subtitle={lang === "AR" ? "نماذج رحلات حقيقية الطابع تساعدك على اختيار التوصيلة المناسبة بثقة." : "Real-style journey examples to help you choose the right private transfer with confidence."}
        />
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURED_JOURNEYS.slice(0, 3).map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/journeys" className="inline-flex items-center justify-center gap-2 rounded-full border border-lux-green/35 px-8 py-3 text-sm font-semibold text-lux-green transition-all hover:bg-lux-green hover:text-white">
            {lang === "AR" ? "استعرض جميع الرحلات" : "Explore All Journeys"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
