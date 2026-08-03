import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router";
import { LuxRideLogo } from "./LuxRideLogo";
import {
  PHONE_DISPLAY,
  TRIPADVISOR_URL,
  whatsappLink,
} from "./data";
import { useLang, t, POPULAR_DEST_LABELS } from "./i18n";
import type { TKey } from "./i18n";

const QUICK_LINKS: Array<{ key: TKey; to: string }> = [
  { key: "nav_home", to: "/" },
  { key: "nav_transfers", to: "/#transfers" },
  { key: "nav_destinations", to: "/destinations" },
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

  return (
    <footer id="contact" className="bg-lux-dark-2 pt-16 text-lux-beige/70">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-12 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        {/* Brand column */}
        <div>
          <LuxRideLogo className="h-16 w-auto" />
          <p className="mt-4 text-sm" style={{ lineHeight: 1.6 }}>
            {t(lang, "footer_desc")}
          </p>
          <div className="mt-5 flex gap-3">
            <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-full border border-[#00aa6c]/50 px-4 text-xs text-[#00aa6c] transition-all hover:bg-[#00aa6c] hover:text-white">
              Tripadvisor
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
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
        <div>
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
        <div>
          <h4 className="text-lux-beige">{t(lang, "footer_contact")}</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-lux-gold" /> {t(lang, "footer_addr")}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-lux-gold" />
              <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-lux-gold">{PHONE_DISPLAY}</a>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-lux-gold" />
              <a href={whatsappLink("Hello LuxRide!")} target="_blank" rel="noreferrer" className="hover:text-lux-gold">
                {t(lang, "footer_wa")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs md:flex-row md:px-8">
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
