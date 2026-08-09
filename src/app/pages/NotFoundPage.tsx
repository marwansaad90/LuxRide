import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

export function NotFoundPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Not Found", "غير موجود")}
      title={L("Page Not Found", "الصفحة غير موجودة")}
      subtitle={L("The page you requested could not be found. You can return to booking, destinations, or contact LuxRide directly.", "تعذّر العثور على الصفحة المطلوبة. يمكنك العودة إلى الحجز أو الوجهات أو التواصل مع LuxRide مباشرة.")}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-4 px-4 text-center md:px-8">
          <Link to="/booking" className="rounded-full bg-lux-green px-7 py-3 text-sm font-semibold text-white transition-all hover:brightness-110">
            {L("Book a Transfer", "احجز توصيلة")}
          </Link>
          <Link to="/destinations" className="rounded-full border border-lux-green/35 px-7 py-3 text-sm font-semibold text-lux-green transition-all hover:bg-lux-green hover:text-white">
            {L("View Destinations", "استعرض الوجهات")}
          </Link>
          <Link to="/contact" className="rounded-full border border-lux-charcoal/15 px-7 py-3 text-sm font-semibold text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green">
            {L("Contact Us", "تواصل معنا")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
