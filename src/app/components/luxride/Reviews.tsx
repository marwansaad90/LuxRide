import { memo, useEffect, useRef } from "react";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";
import {
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  type TripadvisorWidgetConfig,
} from "./tripadvisor";

type TripadvisorWindow = Window & {
  taValidate?: () => void;
  taValList?: Array<() => void>;
  taValIndex?: number;
};

let mountedTripadvisorWidgets = 0;

function OfficialRatingMarkup() {
  return (
    <div id="TA_cdsratingsonlynarrow470" className="TA_cdsratingsonlynarrow">
      <ul id="bx4vQmDEZ" className="TA_links DNOhrQ">
        <li id="dtxM18" className="FHvhKwqM">
          <a target="_blank" rel="noopener noreferrer" href={TRIPADVISOR_PAGE_URL}>
            <img
              src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg"
              alt="Tripadvisor"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialReviewStarterMarkup() {
  return (
    <div id="TA_cdswritereviewnew935" className="TA_cdswritereviewnew">
      <ul id="UAp0qD9lW" className="TA_links 9ACGKVQ5IA">
        <li id="nyGdT00m" className="h5K33J8">
          <a target="_blank" rel="noopener noreferrer" href="https://www.tripadvisor.com/">
            <img
              src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
              alt="Tripadvisor"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialRaveReviewsMarkup() {
  return (
    <div id="TA_cdsscrollingravenarrow782" className="TA_cdsscrollingravenarrow">
      <ul id="LmZYIV0z7lo4" className="TA_links S7dZdrAkw">
        <li id="XOjhynYyd" className="k6uNUW6jDv1E">
          <a target="_blank" rel="noopener noreferrer" href={TRIPADVISOR_PAGE_URL}>
            <img
              src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_vertical.svg"
              alt="Tripadvisor"
              className="widEXCIMG"
              id="CDSWIDEXCLOGO"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialWidgetMarkup({ config }: { config: TripadvisorWidgetConfig }) {
  if (config.key === "rating") return <OfficialRatingMarkup />;
  if (config.key === "reviewStarter") return <OfficialReviewStarterMarkup />;
  return <OfficialRaveReviewsMarkup />;
}

const TripadvisorEmbed = memo(function TripadvisorEmbed({
  config,
}: {
  config: TripadvisorWidgetConfig;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const scriptHostRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLParagraphElement | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    const wrapper = wrapperRef.current;
    const scriptHost = scriptHostRef.current;
    const container = document.getElementById(config.containerId);
    if (!wrapper || !scriptHost || !container || !wrapper.contains(container)) return;

    if (!registeredRef.current) {
      mountedTripadvisorWidgets += 1;
      registeredRef.current = true;
    }

    const runTripadvisorValidators = () => {
      (window as TripadvisorWindow).taValidate?.();
    };
    const attachEmbedLoadListener = (node: Node) => {
      if (!(node instanceof HTMLScriptElement) || !node.src.includes(`WidgetEmbed-${config.widgetType}`)) return;
      node.addEventListener("load", runTripadvisorValidators, { once: true });
    };
    const embedScriptObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(attachEmbedLoadListener));
    });
    embedScriptObserver.observe(document.documentElement, { childList: true, subtree: true });

    const hideLoader = () => {
      loaderRef.current?.setAttribute("hidden", "");
    };
    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
        hideLoader();
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    let script = document.getElementById(config.scriptId) as HTMLScriptElement | null;
    if (!script) {
      document
        .querySelectorAll<HTMLScriptElement>(`script[src*="WidgetEmbed-${config.widgetType}"]`)
        .forEach((staleScript) => staleScript.remove());
      script = document.createElement("script");
      script.id = config.scriptId;
      script.async = true;
      script.src = config.scriptUrl;
      script.setAttribute("data-loadtrk", "");
      script.addEventListener(
        "load",
        () => script?.setAttribute("data-loadtrk", "true"),
        { once: true },
      );
      scriptHost.appendChild(script);
    }

    return () => {
      observer.disconnect();
      embedScriptObserver.disconnect();
      cleanupTimerRef.current = window.setTimeout(() => {
        document.getElementById(config.scriptId)?.remove();
        document
          .querySelectorAll<HTMLScriptElement>(`script[src*="WidgetEmbed-${config.widgetType}"]`)
          .forEach((embedScript) => embedScript.remove());
        scriptHost.replaceChildren();
        if (registeredRef.current) {
          mountedTripadvisorWidgets = Math.max(0, mountedTripadvisorWidgets - 1);
          registeredRef.current = false;
        }
        if (mountedTripadvisorWidgets === 0) {
          const tripadvisorWindow = window as TripadvisorWindow;
          tripadvisorWindow.taValList = [];
          tripadvisorWindow.taValIndex = 0;
        }
        cleanupTimerRef.current = null;
      }, 0);
    };
  }, [config]);

  return (
    <div
      ref={wrapperRef}
      className="tripadvisor-embed min-h-32 min-w-0 max-w-full overflow-x-auto pb-2"
      dir="ltr"
    >
      <p ref={loaderRef} className="mb-3 text-sm text-neutral-500" role="status">
        Loading Tripadvisor reviews…
      </p>
      <OfficialWidgetMarkup config={config} />
      <div ref={scriptHostRef} aria-hidden="true" />
    </div>
  );
});

function TripadvisorWidget({
  config,
  isAR,
}: {
  config: TripadvisorWidgetConfig;
  isAR: boolean;
}) {
  return (
    <article
      className="min-w-0 rounded-2xl border border-lux-charcoal/10 bg-white p-5 shadow-[0_10px_34px_rgba(15,22,35,0.06)]"
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
  const [ratingWidget, reviewStarterWidget, raveReviewsWidget] = TRIPADVISOR_WIDGETS;

  return (
    <section id="reviews" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Tripadvisor"
          title={isAR ? "آراء المسافرين" : "Traveller Reviews"}
          subtitle={
            isAR
              ? "اطّلع على تجارب ضيوفنا الموثّقة وشارك تجربتك مع LuxRide عبر Tripadvisor."
              : "Read verified guest feedback and share your LuxRide experience on Tripadvisor."
          }
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
