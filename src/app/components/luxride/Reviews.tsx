import { memo, useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import tripadvisorLockup from "../../../assets/brand/tripadvisor-lockup.svg";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";
import {
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  TripadvisorWidgetConfig,
  tripadvisorWidgetScriptUrl,
} from "./tripadvisor";

function TripadvisorLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={tripadvisorLockup}
      alt="Tripadvisor"
      className={`h-auto w-40 max-w-full ${className}`}
      dir="ltr"
      draggable={false}
      style={{ direction: "ltr", transform: "none" }}
    />
  );
}

function TripadvisorFallback({
  config,
}: {
  config: TripadvisorWidgetConfig;
}) {
  return (
    <a
      href={TRIPADVISOR_PAGE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-32 flex-col items-start justify-center rounded-xl border border-[#00aa6c]/20 bg-[#f5fffb] p-4 text-start transition-all hover:border-[#00aa6c]/60 hover:bg-white focus-visible:outline-lux-orange"
      aria-label={`${config.fallbackLabelEn} opens in a new tab`}
    >
      <TripadvisorLogo />
      <span className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#007f51]">
        {config.fallbackLabelEn}
        <ExternalLink className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
      </span>
    </a>
  );
}

const TripadvisorEmbed = memo(function TripadvisorEmbed({
  config,
}: {
  config: TripadvisorWidgetConfig;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scriptHostRef = useRef<HTMLDivElement | null>(null);
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
    const scriptHost = scriptHostRef.current;
    if (!scriptHost) return;

    const previous = document.getElementById(scriptId);
    previous?.remove();
    scriptHost.replaceChildren();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    script.dataset.loadtrk = "luxride-tripadvisor";
    script.dataset.tripadvisorWidget = config.uniqueId;
    scriptHost.appendChild(script);

    return () => {
      scriptHost.replaceChildren();
    };
  }, [approached, config.uniqueId, scriptId, scriptUrl]);

  return (
    <div
      ref={containerRef}
      className={`tripadvisor-embed min-h-32 min-w-0 max-w-full ${config.key === "raveReviews" ? "overflow-x-auto pb-2" : "overflow-x-hidden"}`}
      dir="ltr"
    >
      <div id={containerId} className={`TA_${config.widgetType}`}>
        <ul id={linksId} className={`TA_links ${config.uniqueId}`}>
          <li id={linkId}>
            <TripadvisorFallback config={config} />
          </li>
        </ul>
      </div>
      <div ref={scriptHostRef} aria-hidden="true" />
    </div>
  );
});

function TripadvisorWidget({
  config,
  isAR,
  className = "",
}: {
  config: TripadvisorWidgetConfig;
  isAR: boolean;
  className?: string;
}) {
  return (
    <article
      className={`min-w-0 rounded-2xl border border-lux-charcoal/10 bg-white p-5 shadow-[0_10px_34px_rgba(15,22,35,0.06)] ${className}`}
      data-tripadvisor-widget={config.key}
    >
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#007f51]">Tripadvisor</p>
        <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.1rem", fontWeight: 800 }}>
          {isAR ? config.titleAr : config.titleEn}
        </h3>
      </div>
      <TripadvisorEmbed config={config} />
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

        <div data-tripadvisor-row="primary" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TripadvisorWidget config={ratingWidget} isAR={isAR} />
          <TripadvisorWidget config={reviewStarterWidget} isAR={isAR} />
        </div>
        <div data-tripadvisor-row="rave" className="mt-6">
          <TripadvisorWidget config={raveReviewsWidget} isAR={isAR} />
        </div>
      </div>
    </section>
  );
}
