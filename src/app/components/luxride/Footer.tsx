import { Link } from "react-router";
import { LuxRideLogo } from "./LuxRideLogo";
import {
  FACEBOOK_URL,
  EMAIL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  TRIPADVISOR_URL,
  whatsappLink,
} from "./data";
import { useLang, t, POPULAR_DEST_LABELS } from "./i18n";
import type { TKey } from "./i18n";
import { SOCIAL_LOGOS, SocialLogoCircle, TripadvisorLogoMark } from "./SocialBrandIcons";

const QUICK_LINKS: Array<{ key: TKey; to: string }> = [
  { key: "nav_home", to: "/" },
  { key: "nav_transfers", to: "/#transfers" },
  { key: "nav_destinations", to: "/destinations" },
  { key: "nav_featured", to: "/experiences" },
  { key: "nav_about", to: "/about" },
  { key: "nav_fleet", to: "/fleet" },
  { key: "nav_booking", to: "/booking" },
  { key: "nav_faq", to: "/faq" },
  { key: "footer_cancellation", to: "/cancellation-policy" },
  { key: "nav_contact", to: "/contact" },
];

export function Footer() {
  const lang = useLang();
  const destLabels = POPULAR_DEST_LABELS[lang];
  const footerGlyphClass = "h-4 w-4 shrink-0 object-contain brightness-0 invert";
  const footerSocialGlyphClass = "h-5 w-5 brightness-0 invert";
  const footerColumnClass = "min-w-0 px-1 sm:px-0";

  return (
    <footer id="contact" className="bg-lux-dark-2 pt-16 text-lux-beige/70">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-8 pb-12 sm:px-10 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        {/* Brand column */}
        <div className={footerColumnClass}>
          <LuxRideLogo className="h-16 w-auto" />
          <p className="mt-4 max-w-sm text-sm" style={{ lineHeight: 1.6 }}>
            {t(lang, "footer_desc")}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a href={whatsappLink("Hello LuxRide!")} target="_blank" rel="noopener noreferrer" aria-label="LuxRide on WhatsApp" className="transition-transform hover:-translate-y-0.5">
              <SocialLogoCircle src={SOCIAL_LOGOS.whatsapp} alt="" className="h-10 w-10 bg-transparent" imgClassName={footerSocialGlyphClass} />
            </a>
            <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" aria-label="LuxRide on Tripadvisor" className="transition-transform hover:-translate-y-0.5">
              <TripadvisorLogoMark imgClassName="brightness-0 invert" />
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="LuxRide on Facebook" className="transition-transform hover:-translate-y-0.5">
              <SocialLogoCircle src={SOCIAL_LOGOS.facebook} alt="" className="h-10 w-10 bg-transparent" imgClassName={footerSocialGlyphClass} />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="LuxRide on Instagram" className="transition-transform hover:-translate-y-0.5">
              <SocialLogoCircle src={SOCIAL_LOGOS.instagram} alt="" className="h-10 w-10 bg-transparent" imgClassName={footerSocialGlyphClass} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div className={footerColumnClass}>
          <h4 className="text-lux-beige">{t(lang, "footer_quick")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((q) => (
              <li key={q.to}>
                <Link to={q.to} className="transition-colors hover:text-lux-green">
                  {t(lang, q.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Destinations */}
        <div className={footerColumnClass}>
          <h4 className="text-lux-beige">{t(lang, "footer_dests")}</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {destLabels.map((d) => (
              <li key={d}>
                <Link to="/destinations" className="transition-colors hover:text-lux-green">{d}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={footerColumnClass}>
          <h4 className="text-lux-beige">{t(lang, "footer_contact")}</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <img src={SOCIAL_LOGOS.location} alt="" className={`mt-0.5 ${footerGlyphClass}`} loading="lazy" /> {t(lang, "footer_addr")}
            </li>
            <li className="flex items-center gap-3">
              <img src={SOCIAL_LOGOS.email} alt="" className={footerGlyphClass} loading="lazy" />
              <a href={`mailto:${EMAIL}`} className="hover:text-lux-client-accent">{EMAIL}</a>
            </li>
            <li className="flex items-center gap-3">
              <img src={SOCIAL_LOGOS.phone} alt="" className={footerGlyphClass} loading="lazy" />
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} dir="ltr" className="hover:text-lux-client-accent" style={{ unicodeBidi: "isolate" }}>{PHONE_DISPLAY}</a>
            </li>
            <li className="flex items-center gap-3">
              <img src={SOCIAL_LOGOS.whatsapp} alt="" className={footerGlyphClass} loading="lazy" />
              <a href={whatsappLink("Hello LuxRide!")} target="_blank" rel="noopener noreferrer" className="hover:text-lux-client-accent">
                {t(lang, "footer_wa")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-8 py-6 text-xs sm:px-10 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} {t(lang, "footer_copy")}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/cancellation-policy" className="hover:text-lux-green">{t(lang, "footer_cancellation")}</Link>
            <Link to="/privacy-policy" className="hover:text-lux-green">{t(lang, "footer_privacy")}</Link>
            <Link to="/terms" className="hover:text-lux-green">{t(lang, "footer_terms")}</Link>
            <span className="text-lux-beige/40">EN · AR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
