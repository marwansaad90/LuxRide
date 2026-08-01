import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { SectionHeading } from "./Sections";
import { useLang, t, FAQS } from "./i18n";

export function FAQ() {
  const lang = useLang();
  const faqs = FAQS[lang];

  return (
    <section className="bg-lux-beige py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "faq_eyebrow")}
          title={t(lang, "faq_title")}
        />
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-lux-charcoal/10 bg-white px-5"
            >
              <AccordionTrigger className="text-left text-lux-charcoal hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-500">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
