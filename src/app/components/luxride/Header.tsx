import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { LuxRideLogo } from "./LuxRideLogo";
import { PHONE_DISPLAY } from "./data";
import { useLang, t } from "./i18n";
import type { Lang, TKey } from "./i18n";

const NAV: Array<{ key: TKey; to: string }> = [
  { key: "nav_home", to: "/" },
  { key: "nav_about", to: "/about" },
  { key: "nav_fleet", to: "/fleet" },
  { key: "nav_destinations", to: "/destinations" },
  { key: "nav_booking", to: "/booking" },
  { key: "nav_faq", to: "/faq" },
  { key: "nav_contact", to: "/contact" },
];

export function Header({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  const currentLang = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.10)] border-b border-gray-100"
          : "bg-lux-green"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" aria-label="LuxRide home" className="flex h-16 w-16 items-center justify-center">
          <LuxRideLogo className="h-16 w-16 drop-shadow-[0_2px_10px_rgba(0,0,0,0.18)]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 xl:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-base tracking-wide font-semibold transition-colors ${
                scrolled
                  ? pathname === n.to
                    ? "text-lux-green"
                    : "text-lux-charcoal hover:text-lux-green"
                  : pathname === n.to
                  ? "text-white"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t(currentLang, n.key)}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div
            className={`hidden items-center rounded-full p-0.5 sm:flex border ${
              scrolled ? "border-lux-green/40" : "border-white/40"
            }`}
          >
            {(["EN", "AR"] as const).map((l) => (
              <button
                type="button"
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs tracking-wide transition-colors ${
                  lang === l
                    ? "bg-lux-green text-white"
                    : scrolled
                    ? "text-lux-charcoal hover:text-lux-green"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <a
            href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
            className={`hidden items-center gap-2 text-sm transition-colors lg:flex ${
              scrolled ? "text-lux-charcoal hover:text-lux-green" : "text-white/90 hover:text-white"
            }`}
          >
            <Phone className={`h-4 w-4 ${scrolled ? "text-lux-green" : "text-white"}`} />
            {PHONE_DISPLAY}
          </a>

          <Link
            to="/booking"
            className={`hidden rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all md:inline-block ${
              scrolled
                ? "bg-lux-green text-white hover:brightness-110"
                : "bg-white text-lux-green hover:bg-lux-beige"
            }`}
          >
            {t(currentLang, "book_your_transfer")}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`rounded-lg p-1 xl:hidden ${scrolled ? "text-lux-charcoal" : "text-white"}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-navigation"
          className={`border-t px-4 py-4 xl:hidden ${
            scrolled ? "bg-white border-gray-100" : "bg-lux-green border-white/20"
          }`}
        >
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-lg px-3 py-3 text-base font-semibold transition-colors ${
                  scrolled
                    ? "text-lux-charcoal hover:bg-gray-50 hover:text-lux-green"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(currentLang, n.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <div
              className={`flex items-center rounded-full p-0.5 border ${
                scrolled ? "border-lux-green/40" : "border-white/40"
              }`}
            >
              {(["EN", "AR"] as const).map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-4 py-1.5 text-xs ${
                    lang === l
                      ? "bg-lux-green text-white"
                      : scrolled
                      ? "text-lux-charcoal"
                      : "text-white/80"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Link
              to="/booking"
              className={`flex-1 rounded-full px-5 py-2.5 text-center text-sm font-medium ${
                scrolled
                  ? "bg-lux-green text-white"
                  : "bg-white text-lux-green"
              }`}
            >
              {t(currentLang, "book_your_transfer")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
