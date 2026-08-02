import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";
import {
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  TripadvisorWidgetConfig,
  tripadvisorWidgetScriptUrl,
} from "./tripadvisor";

function TripadvisorTextLockup() {
  return (
    <span className="inline-flex items-center" dir="ltr">
      <span className="font-semibold text-[#1f2933]">Tripadvisor</span>
    </span>
  );
}

function TripadvisorFallback({
  config,
  isAR,
}: {
  config: TripadvisorWidgetConfig;
  isAR: boolean;
}) {
  return (
    <a
      href={TRIPADVISOR_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-28 flex-col justify-center rounded-xl border border-[#00aa6c]/20 bg-[#f5fffb] p-4 text-start transition-all hover:border-[#00aa6c]/60 hover:bg-white focus-visible:outline-lux-orange"
      aria-label={`${isAR ? config.fallbackLabelAr : config.fallbackLabelEn} ${isAR ? "يفتح في تبويب جديد" : "opens in a new tab"}`}
    >
      <TripadvisorTextLockup />
      <span className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#007f51]">
        {isAR ? config.fallbackLabelAr : config.fallbackLabelEn}
        <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
      </span>
    </a>
  );
}

function TripadvisorWidget({
  config,
  isAR,
  className = "",
}: {
  config: TripadvisorWidgetConfig;
  isAR: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [approached, setApproached] = useState(false);
  const containerId = `TA_${config.widgetType}${config.uniqueId}`;
  const linksId = `TA_links_${config.uniqueId}`;
  const linkId = `CDSWID${config.uniqueId}`;
  const scriptId = `luxride-tripadvisor-${config.widgetType}-${config.uniqueId}`;
  const scriptUrl = tripadvisorWidgetScriptUrl(config);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setApproached(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setApproached(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!approached) return;
    const previous = document.getElementById(scriptId);
    previous?.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    script.dataset.loadtrk = "luxride-tripadvisor";
    containerRef.current?.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [approached, scriptId, scriptUrl]);

  return (
    <article className={`rounded-2xl border border-lux-charcoal/10 bg-white p-5 shadow-[0_10px_34px_rgba(15,22,35,0.06)] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#007f51]">Tripadvisor</p>
          <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
            {isAR ? config.titleAr : config.titleEn}
          </h3>
        </div>
        <TripadvisorTextLockup />
      </div>

      <div
        ref={containerRef}
        className={`min-h-32 ${config.key === "raveReviews" ? "overflow-x-auto pb-2" : ""}`}
        dir="ltr"
      >
        <div id={containerId} className={`TA_${config.widgetType}`}>
          <ul id={linksId} className={`TA_links ${config.uniqueId}`}>
            <li id={linkId}>
              <TripadvisorFallback config={config} isAR={isAR} />
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}

export function Reviews() {
  const lang = useLang();
  const isAR = lang === "AR";
  const ratingWidget = TRIPADVISOR_WIDGETS.find((widget) => widget.key === "rating")!;
  const reviewStarterWidget = TRIPADVISOR_WIDGETS.find((widget) => widget.key === "reviewStarter")!;
  const raveReviewsWidget = TRIPADVISOR_WIDGETS.find((widget) => widget.key === "raveReviews")!;

  return (
    <section id="reviews" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={isAR ? "Tripadvisor" : "Tripadvisor"}
          title={isAR ? "آراء المسافرين" : "Traveller Reviews"}
          subtitle={isAR ? "تُعرض المراجعات الرسمية من Tripadvisor عند توفر الاتصال بالودجت." : "Official Tripadvisor widgets appear here when the third-party script is available."}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TripadvisorWidget config={ratingWidget} isAR={isAR} />
          <TripadvisorWidget config={reviewStarterWidget} isAR={isAR} />
          <TripadvisorWidget config={raveReviewsWidget} isAR={isAR} className="lg:col-span-2" />
        </div>
      </div>
    </section>
  );
}
