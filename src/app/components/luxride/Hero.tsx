import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router";
import { FLEET, whatsappLink } from "./data";
import { useLang, t } from "./i18n";

export function Hero() {
  const lang = useLang();
  const isAR = lang === "AR";
  const xpander = FLEET[0];

  return (
    <section id="home" className="overflow-hidden bg-gradient-to-br from-white via-[#f7fbf8] to-[#eef7f1] pt-24">
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-[1.18fr_0.82fr]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-lux-green/25 bg-white px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-lux-green shadow-sm">
            {t(lang, "hero_badge")}
          </span>

          <h1
            className="mt-5 text-lux-charcoal"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.65rem, 4vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: isAR ? undefined : "-0.025em",
            }}
          >
            {isAR ? (
              <>
                نقل خاص فاخر
                <br />
                في <span className="text-lux-green">الغردقة</span>
              </>
            ) : (
              <>
                <span className="block lg:whitespace-nowrap">Premium Private Transfers</span>
                <span className="block">in <span className="text-lux-green">Hurghada</span></span>
              </>
            )}
          </h1>

          <p className="mt-5 max-w-xl text-neutral-600" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
            {t(lang, "hero_sub")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/#estimate"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white shadow-lg shadow-lux-green/25 transition-all hover:brightness-110"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem" }}
            >
              {isAR ? "احسب سعرك" : "Calculate Your Price"} <ArrowRight className="h-5 w-5 rtl:rotate-180" />
            </Link>
            <a
              href={whatsappLink("Hello LuxRide, I'd like to enquire about a transfer.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-lux-green/35 bg-white px-8 py-3.5 text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem" }}
            >
              <MessageCircle className="h-5 w-5 text-lux-green" />
              {isAR ? "تواصل معنا على واتساب" : "Contact Us on WhatsApp"}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-lux-green/10 blur-3xl" />
          <div className="relative rounded-[2rem] border border-lux-green/15 bg-white p-5 shadow-[0_24px_70px_rgba(0,80,30,0.12)] sm:p-8">
            <img
              src={xpander.image}
              alt={xpander.name}
              className="h-[260px] w-full object-contain sm:h-[330px]"
              style={{ direction: "ltr" }}
            />
            <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
              <strong className="text-lux-charcoal">{xpander.name}</strong>
              <span>{isAR ? "حتى 4 ركاب و4 حقائب" : "Up to 4 passengers and 4 bags"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
