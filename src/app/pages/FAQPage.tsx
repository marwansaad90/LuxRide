import { Link } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { PageShell } from "../components/luxride/PageShell";
import { FAQ_PAGE_ITEMS } from "../components/luxride/faqPageData";
import { useL, useLang } from "../components/luxride/i18n";

export function FAQPage() {
  const L = useL();
  const lang = useLang();
  const faqs = FAQ_PAGE_ITEMS[lang];

  return (
    <PageShell
      crumb={L("FAQ", "الأسئلة الشائعة")}
      title={L("Frequently Asked Questions", "الأسئلة الشائعة")}
      subtitle={L("Everything you need to know about booking, pricing, permits and travelling with LuxRide.", "كل ما تحتاج معرفته عن الحجز والأسعار والتصاريح والسفر مع LuxRide.")}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-lux-charcoal/10 bg-white px-5">
                <AccordionTrigger className="text-start text-lux-charcoal hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-neutral-500">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 rounded-2xl border border-lux-green/25 bg-white p-7 text-center">
            <p className="text-lux-charcoal">{L("Still have a question?", "لا تزال لديك أسئلة؟")}</p>
            <p className="mt-1 text-sm text-neutral-500">{L("Our team is happy to help on WhatsApp.", "يسعد فريقنا بمساعدتك عبر واتساب.")}</p>
            <Link to="/contact" className="mt-4 inline-block rounded-full bg-lux-green px-7 py-3 text-sm text-white transition-all hover:brightness-110">{L("Contact Us", "اتصل بنا")}</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
