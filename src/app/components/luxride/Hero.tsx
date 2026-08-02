import { ArrowRight, MessageCircle } from "lucide-react";
import { EstimateYourTrip } from "./EstimateYourTrip";
import hurghadaAlMina from "../../../assets/hero/hurghada-al-mina.jpg";
import { whatsappLink } from "./data";
import { useLang, t } from "./i18n";

export function Hero() {
  const lang = useLang();
  const isAR = lang === "AR";

  function focusCalculator() {
    window.requestAnimationFrame(() => {
      document.getElementById("estimate")?.focus({ preventScroll: true });
    });
  }

  return (
    <section
      id="home"
      className="luxride-hero relative isolate overflow-hidden bg-lux-dark bg-cover pt-20 md:pt-20"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(15,22,35,0.58) 0%, rgba(15,22,35,0.31) 42%, rgba(15,22,35,0.10) 100%), url(${hurghadaAlMina})`,
      }}
    >
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,22,35,0.16)_0%,rgba(15,22,35,0.05)_44%,rgba(15,22,35,0.22)_100%)]" />
      <div className="mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-6 px-4 py-5 md:px-8 md:py-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-10 lg:py-0">
        <div className="max-w-2xl text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/16 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
            {t(lang, "hero_badge")}
          </span>

          <h1
            className="mt-4 text-balance drop-shadow-[0_3px_18px_rgba(0,0,0,0.35)]"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.45rem, 5vw, 4.75rem)",
              fontWeight: 800,
              lineHeight: 0.98,
            }}
          >
            {isAR ? (
              <>
                نقل خاص فاخر
                <br />
                في الغردقة
              </>
            ) : (
              <>
                Premium Private Transfers
                <br />
                in Hurghada
              </>
            )}
          </h1>

          <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-white/90 drop-shadow md:text-lg">
            {t(lang, "hero_sub")}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#estimate"
              onClick={focusCalculator}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lux-green px-7 py-3 text-white shadow-lg shadow-lux-green/25 transition-all hover:brightness-110"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem" }}
            >
              {isAR ? "احسب سعرك" : "Calculate Your Price"}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </a>
            <a
              href={whatsappLink("Hello LuxRide, I'd like to enquire about a transfer.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/55 bg-white/90 px-7 py-3 text-lux-charcoal shadow-lg transition-all hover:bg-white hover:text-lux-green"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem" }}
            >
              <MessageCircle className="h-5 w-5 text-lux-green" />
              {isAR ? "تواصل معنا على واتساب" : "Contact Us on WhatsApp"}
            </a>
          </div>
        </div>

        <div className="w-full justify-self-center lg:justify-self-end">
          <EstimateYourTrip />
        </div>
      </div>
    </section>
  );
}
