import { ExternalLink, Quote, Star } from "lucide-react";
import { REVIEWS, TRIPADVISOR_URL } from "./data";
import { SectionHeading } from "./Sections";
import { useLang, t } from "./i18n";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < n ? "fill-lux-gold text-lux-gold" : "text-neutral-300"}`}
        />
      ))}
    </div>
  );
}

export function Reviews() {
  const lang = useLang();

  return (
    <section id="reviews" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "rev_eyebrow")}
          title={t(lang, "rev_title")}
        />

        {/* Tripadvisor rating badge */}
        <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center justify-between gap-6 rounded-2xl border border-[#00aa6c]/25 bg-[#00aa6c]/5 p-6 sm:flex-row sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00aa6c] text-white" style={{ fontSize: "1.75rem" }}>
              ◉
            </div>
            <div>
              <p className="text-lux-charcoal">{t(lang, "rev_ta_name")}</p>
              <p className="text-sm text-neutral-500">{t(lang, "rev_ta_sub")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lux-charcoal" style={{ fontSize: "1rem", fontWeight: 700 }}>
              {lang === "AR" ? "التقييم قيد الانتظار" : "Rating pending"}
            </span>
            <div>
              <Stars n={0} />
              <p className="text-sm text-neutral-500">{lang === "AR" ? "عدد المراجعات مطلوب" : "Review count required"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={TRIPADVISOR_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-[#00aa6c] px-5 py-3 text-sm text-white transition-all hover:brightness-110">
              {lang === "AR" ? "قراءة كل المراجعات" : "Read All Reviews"} <ExternalLink className="h-4 w-4" />
            </a>
            <a href={TRIPADVISOR_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-[#00aa6c]/40 bg-white px-5 py-3 text-sm text-[#007f51] transition-all hover:border-[#00aa6c]">
              {lang === "AR" ? "اكتب مراجعة" : "Write a Review"} <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="flex snap-x gap-6 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="relative min-w-[85%] snap-start rounded-2xl border border-lux-charcoal/8 bg-lux-beige/50 p-7 sm:min-w-[48%] md:min-w-0"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-lux-gold/25" />
              <Stars n={r.rating} />
              <p className="mt-4 text-neutral-600" style={{ lineHeight: 1.6 }}>
                {r.text}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-lux-charcoal/10 pt-4">
                <div>
                  <p className="text-lux-charcoal">{r.name}</p>
                  <p className="text-sm text-neutral-500">{r.country}</p>
                </div>
                <span className="rounded-full bg-lux-gold/15 px-3 py-1 text-xs text-lux-bronze">
                  {r.trip}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          {lang === "AR" ? "سيتم ربط محتوى Tripadvisor المعتمد في مرحلة ووردبريس." : "Approved Tripadvisor content will be connected during the WordPress phase."}
        </p>
      </div>
    </section>
  );
}
