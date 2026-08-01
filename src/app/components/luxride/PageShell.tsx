import { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";
import { useLang } from "./i18n";

export function PageShell({
  title,
  subtitle,
  crumb,
  children,
}: {
  title: string;
  subtitle?: string;
  crumb: string;
  children: ReactNode;
}) {
  const lang = useLang();

  return (
    <>
      {/* Page hero band — clears the fixed header */}
      <section className="relative overflow-hidden bg-lux-dark pt-28 pb-14 md:pt-32 md:pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-lux-green/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-lux-beige/60">
            <Link to="/" className="flex items-center gap-1 transition-colors hover:text-lux-green">
              <Home className="h-3.5 w-3.5" /> {lang === "AR" ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className="text-lux-beige/85">{crumb}</span>
          </nav>
          <h1
            className="mt-4 text-lux-beige"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700, lineHeight: 1.1 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-lux-beige/75" style={{ lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
      </section>
      {children}
    </>
  );
}
