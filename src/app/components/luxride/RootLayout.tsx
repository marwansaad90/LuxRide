import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LangContext, t } from "./i18n";
import type { Lang } from "./i18n";
import { whatsappLink } from "./data";
import { WhatsAppIcon } from "./WhatsAppIcon";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function RootLayout() {
  const [lang, setLang] = useState<Lang>("EN");
  const [showMobileActions, setShowMobileActions] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = lang === "AR" ? "ar" : "en";
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) {
      setShowMobileActions(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setShowMobileActions(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <LangContext.Provider value={lang}>
      <div
        dir={lang === "AR" ? "rtl" : "ltr"}
        className="luxride-shell min-h-screen w-full overflow-x-hidden bg-white"
        style={
          {
            "--font-body": lang === "AR" ? "Cairo, sans-serif" : "'Barlow', sans-serif",
            "--font-heading": lang === "AR" ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif",
          } as CSSProperties
        }
      >
        <ScrollToTop />
        <Header lang={lang} setLang={setLang} />
        <main id="main-content" className="pb-20 md:pb-0">
          <Outlet />
        </main>
        <Footer />

        {/* Floating WhatsApp button (desktop / tablet) */}
        <a
          href={whatsappLink("Hello LuxRide, I'd like to book a transfer.")}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-lux-green text-white shadow-2xl shadow-lux-green/30 transition-all hover:brightness-110 md:flex ltr:right-6 rtl:left-6"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>

        {/* Sticky mobile action bar */}
        <div
          className={`fixed inset-x-0 bottom-0 z-50 flex gap-3 border-t border-lux-green/20 bg-lux-dark/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
            showMobileActions ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          aria-hidden={!showMobileActions}
        >
          <Link
            to="/booking"
            className="flex-1 rounded-full bg-lux-green py-3 text-center text-sm text-white"
          >
            {t(lang, "sticky_book")}
          </Link>
          <a
            href={whatsappLink("Hello LuxRide, I'd like to book a transfer.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-lux-green/40 px-5 py-3 text-sm text-lux-beige"
          >
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp
          </a>
        </div>
      </div>
    </LangContext.Provider>
  );
}
