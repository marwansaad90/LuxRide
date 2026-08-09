import { ReactNode } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router";
import { useLang } from "./i18n";

export function PageShell({
  title,
  subtitle,
  crumb,
  children,
  tone = "dark",
}: {
  title: string;
  subtitle?: string;
  crumb: string;
  children: ReactNode;
  tone?: "dark" | "brand" | "contact";
}) {
  const lang = useLang();
  const isBrand = tone === "brand" || tone === "contact";
  const isContact = tone === "contact";

  return (
    <>
      {/* Page hero band — clears the fixed header */}
      <section className={`relative overflow-hidden pt-28 pb-14 md:pt-32 md:pb-16 ${isBrand ? (isContact ? "bg-[#FBF5EF]" : "bg-[#F6EFE6]") : "bg-lux-dark"}`}>
        <div className={`absolute inset-0 ${isBrand ? (isContact ? "bg-[radial-gradient(circle_at_top_left,rgba(204,153,102,0.16),transparent_36%),linear-gradient(180deg,rgba(0,107,92,0.045),transparent)]" : "bg-[radial-gradient(circle_at_top_left,rgba(204,153,102,0.24),transparent_38%),linear-gradient(180deg,rgba(0,107,92,0.08),transparent)]") : "bg-gradient-to-b from-lux-green/10 to-transparent"}`} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <nav className={`flex items-center gap-1.5 text-xs ${isBrand ? "text-lux-charcoal/60" : "text-lux-beige/60"}`}>
            <Link to="/" className="flex items-center gap-1 transition-colors hover:text-lux-green">
              <Home className="h-3.5 w-3.5" /> {lang === "AR" ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            <span className={isBrand ? "text-lux-charcoal/85" : "text-lux-beige/85"}>{crumb}</span>
          </nav>
          <h1
            className={`mt-4 ${isBrand ? "text-lux-charcoal" : "text-lux-beige"}`}
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 700, lineHeight: 1.1 }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-4 max-w-2xl ${isBrand ? (isContact ? "text-lux-charcoal/85" : "text-lux-charcoal/75") : "text-lux-beige/75"}`} style={{ lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
      </section>
      {children}
    </>
  );
}
