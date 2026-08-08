import { memo, useEffect, useRef } from "react";
import { SectionHeading } from "./Sections";
import { useLang } from "./i18n";
import {
  SELECTED_TRIPADVISOR_REVIEW_COUNT,
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  type TripadvisorWidgetConfig,
} from "./tripadvisor";

type TripadvisorWindow = Window & {
  taValidate?: () => void;
  taValList?: Array<() => void>;
  taValIndex?: number;
  resizeRatingsOnlyWidget?: () => void;
};

let mountedTripadvisorWidgets = 0;

function OfficialRatingMarkup() {
  return (
    <div id="TA_cdsratingsonlynarrow411" className="TA_cdsratingsonlynarrow">
      <ul id="6lnrWKdO4D8" className="TA_links 0w64j5lco8U">
        <li id="noMPpE3HQTk" className="AdrVwR">
          <a target="_blank" rel="noopener noreferrer" href={TRIPADVISOR_PAGE_URL}>
            <img
              src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-18034-2.svg"
              alt="TripAdvisor"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialExcellentMarkup() {
  return (
    <div id="TA_excellent384" className="TA_excellent">
      <ul id="1PjMSU" className="TA_links wbxcEDs6AS">
        <li id="L9nzCG99" className="rFpF7AqG">
          <a target="_blank" rel="noopener noreferrer" href={TRIPADVISOR_PAGE_URL}>
            <img
              src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg"
              alt="TripAdvisor"
              className="widEXCIMG"
              id="CDSWIDEXCLOGO"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialSelfServeMarkup() {
  return (
    <div id="TA_selfserveprop491" className="TA_selfserveprop">
      <ul id="9TrJubwou1V" className="TA_links 3pgQkqHD">
        <li id="AT1lavT5Wb" className="P7zbJRTqQon">
          <a target="_blank" rel="noopener noreferrer" href={TRIPADVISOR_PAGE_URL}>
            <img
              src="https://www.tripadvisor.com/img/cdsi/img2/branding/v2/Tripadvisor_lockup_horizontal_secondary_registered-11900-2.svg"
              alt="TripAdvisor"
            />
          </a>
        </li>
      </ul>
    </div>
  );
}

function OfficialWidgetMarkup({ config }: { config: TripadvisorWidgetConfig }) {
  if (config.key === "rating") return <OfficialRatingMarkup />;
  if (config.key === "excellent") return <OfficialExcellentMarkup />;
  return <OfficialSelfServeMarkup />;
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

    const tripadvisorWindow = window as TripadvisorWindow;
    tripadvisorWindow.resizeRatingsOnlyWidget ??= () => undefined;

    if (!registeredRef.current) {
      mountedTripadvisorWidgets += 1;
      registeredRef.current = true;
    }

    const runTripadvisorValidators = () => {
      tripadvisorWindow.taValidate?.();
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
      className="tripadvisor-embed flex min-h-32 min-w-0 max-w-full items-center justify-center overflow-x-auto pb-2 text-center"
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
  large = false,
}: {
  config: TripadvisorWidgetConfig;
  isAR: boolean;
  large?: boolean;
}) {
  return (
    <article className={`flex min-w-0 items-center justify-center rounded-2xl border border-lux-charcoal/10 bg-white p-5 shadow-[0_10px_34px_rgba(15,22,35,0.06)] ${large ? "min-h-[23rem]" : "min-h-[11rem]"}`} data-tripadvisor-widget={config.key} aria-label={isAR ? "محتوى Tripadvisor الرسمي" : "Official Tripadvisor content"}>
      <TripadvisorEmbed config={config} />
    </article>
  );
}

export function Reviews() {
  const lang = useLang();
  const isAR = lang === "AR";
  const [reviewsWidget, ratingWidget, excellentWidget] = TRIPADVISOR_WIDGETS;

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

        <div data-tripadvisor-layout="latest-pdf" data-tripadvisor-selected-reviews={SELECTED_TRIPADVISOR_REVIEW_COUNT} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
          <TripadvisorWidget config={reviewsWidget} isAR={isAR} large />
          <div className="grid gap-6">
            <TripadvisorWidget config={ratingWidget} isAR={isAR} />
            <TripadvisorWidget config={excellentWidget} isAR={isAR} />
          </div>
        </div>
      </div>
    </section>
  );
}
