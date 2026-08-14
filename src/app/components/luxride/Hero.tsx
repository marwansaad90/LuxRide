import { ArrowRight, BadgeCheck, CarFront, Plane, ShieldCheck } from "lucide-react";
import { EstimateYourTrip } from "./EstimateYourTrip";
import hurghadaAlMina from "../../../assets/hero/hurghada-al-mina.webp";
import { settingsWhatsappLink, useSiteSettings } from "./cms";
import { useLang, t } from "./i18n";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Hero() {
  const lang = useLang();
  const settings = useSiteSettings();
  const isAR = lang === "AR";
  const trustBadges = [
    { Icon: BadgeCheck, en: "Fixed Rates", ar: "أسعار ثابتة" },
    { Icon: ShieldCheck, en: "Official Compliance", ar: "امتثال رسمي" },
    { Icon: Plane, en: "Live Flight Tracking", ar: "متابعة الطيران" },
    { Icon: CarFront, en: "Modern Fleet", ar: "أسطول حديث" },
  ];

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
      <div className="mx-auto grid min-h-[calc(100svh-80px)] w-full max-w-7xl items-center gap-6 overflow-hidden px-4 py-5 md:px-8 md:py-5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-10 lg:py-0">
        <div className={`${isAR ? "max-w-3xl" : "max-w-2xl"} min-w-0 text-white`}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/16 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur-md">
            {t(lang, "hero_badge")}
          </span>

          <h1
            className="mt-4 max-w-[calc(100vw-2rem)] text-balance break-words drop-shadow-[0_3px_18px_rgba(0,0,0,0.35)] md:max-w-full"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: isAR ? "clamp(2.25rem, 3.65vw, 4.05rem)" : "clamp(2.45rem, 5vw, 4.75rem)",
              fontWeight: 800,
              lineHeight: isAR ? 1.16 : 0.98,
              maxWidth: isAR ? "21ch" : undefined,
            }}
          >
            {isAR ? "ارتقِ بتجربة تنقلك في الغردقة والبحر الأحمر" : "Elevate Your Journey in Hurghada"}
          </h1>

          <p className="mt-3 max-w-[calc(100vw-2rem)] text-pretty break-words text-base leading-7 text-white/90 drop-shadow md:max-w-xl md:text-lg">
            {isAR
              ? "خدمة ليموزين ونقل سياحي راقية بأسعار ثابتة 100% وأسطول حديث يُلبي كافة توصيلاتك وتوصيلات المطار."
              : "Premium limousine and tourist transfer services with 100% fixed prices and a modern fleet tailored for your airport transfers and private transfers."}
          </p>

          <div className="mt-4 grid max-w-[calc(100vw-2rem)] grid-cols-1 gap-2 sm:grid-cols-2 md:max-w-2xl">
            {trustBadges.map(({ Icon, en, ar }) => (
              <div key={en} className="flex max-w-full items-center gap-2 rounded-xl border border-white/18 bg-white/10 px-3 py-2 text-sm text-white shadow-sm backdrop-blur-md sm:max-w-[17rem]">
                <Icon className="h-4 w-4 shrink-0 text-[#F3D8B6]" />
                <span className="leading-snug">{isAR ? ar : en}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex max-w-[calc(100vw-2rem)] flex-col gap-3 sm:flex-row sm:flex-wrap md:max-w-full">
            <a
              href="#estimate"
              onClick={focusCalculator}
              className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 rounded-full bg-lux-green px-7 py-3 text-white transition-all hover:brightness-110 sm:w-auto"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem" }}
            >
              {isAR ? "احسب سعرك" : "Calculate Your Price"}
              <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </a>
            <a
              href={settingsWhatsappLink(settings, "Hello LuxRide, I'd like to enquire about a transfer.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full max-w-full items-center justify-center gap-2 rounded-full border border-white/55 bg-white/90 px-7 py-3 text-lux-charcoal shadow-lg transition-all hover:bg-white hover:text-lux-green sm:w-auto"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem" }}
            >
              <WhatsAppIcon className="h-5 w-5 text-lux-green" />
              {isAR ? "تواصل معنا على واتساب" : "Contact Us on WhatsApp"}
            </a>
          </div>
        </div>

        <div className="min-w-0 w-full justify-self-center lg:justify-self-end">
          <EstimateYourTrip />
        </div>
      </div>
    </section>
  );
}
