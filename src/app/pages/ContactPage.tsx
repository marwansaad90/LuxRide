import { useState, type FormEvent } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageShell } from "../components/luxride/PageShell";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { EMAIL, FACEBOOK_URL, INSTAGRAM_URL, PHONE_DISPLAY, TRIPADVISOR_URL, whatsappLink } from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";
import { WhatsAppIcon } from "../components/luxride/WhatsAppIcon";
import { SOCIAL_LOGOS, SocialLogoCircle, TripadvisorLogoCircle } from "../components/luxride/SocialBrandIcons";

export function ContactPage() {
  const L = useL();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError(L("Please enter your name and message.", "يرجى إدخال اسمك ورسالتك."));
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(L("Please enter a valid email address or leave the email field empty.", "يرجى إدخال بريد إلكتروني صالح أو ترك الحقل فارغاً."));
      return;
    }
    setError("");
    const body = `Name: ${name.trim()}\nEmail: ${email.trim() || "Not provided"}\nMessage: ${message.trim()}`;
    window.open(whatsappLink(body), "_blank", "noopener,noreferrer");
  };

  const contactCardClass =
    "flex min-h-[104px] items-center gap-3 rounded-2xl border border-lux-charcoal/8 bg-white px-5 py-4 transition-all hover:border-lux-green hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)]";
  const iconClass = "h-5 w-5 shrink-0 text-lux-green";
  const socialIconFilter = {
    filter: "brightness(0) saturate(100%) invert(32%) sepia(51%) saturate(1052%) hue-rotate(122deg) brightness(91%) contrast(94%)",
  };
  const cardTextClass = "min-w-0 flex-1";
  const primaryLineClass = "block whitespace-nowrap text-[0.82rem] leading-tight text-lux-charcoal xl:text-[0.95rem]";

  return (
    <PageShell
      crumb={L("Contact", "اتصل بنا")}
      title={L("Get in Touch", "تواصل معنا")}
      subtitle={L(
        "Plan your transfer with LuxRide by phone or WhatsApp.",
        "خطّط لتوصيلتك مع LuxRide عبر الهاتف أو واتساب.",
      )}
      tone="contact"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className={contactCardClass}>
              <Phone className={iconClass} />
              <span className={cardTextClass}><span className="block text-sm text-neutral-500">{L("Phone", "الهاتف")}</span><span className={primaryLineClass} dir="ltr">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={`mailto:${EMAIL}`} className={contactCardClass}>
              <Mail className={iconClass} />
              <span className={cardTextClass}><span className="block text-sm text-neutral-500">{L("Email", "البريد الإلكتروني")}</span><span className={primaryLineClass} dir="ltr">{EMAIL}</span></span>
            </a>
            <a href={whatsappLink("Hello LuxRide!")} target="_blank" rel="noopener noreferrer" className={contactCardClass}>
              <SocialLogoCircle src={SOCIAL_LOGOS.whatsapp} alt="" className="h-5 w-5" imgClassName="max-h-5 max-w-5" imgStyle={socialIconFilter} />
              <span className={cardTextClass}><span className="block text-sm text-neutral-500">WhatsApp</span><span className={primaryLineClass} dir="ltr">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={contactCardClass} aria-label="LuxRide on Facebook">
              <SocialLogoCircle src={SOCIAL_LOGOS.facebook} alt="" className="h-5 w-5" imgClassName="max-h-5 max-w-5" imgStyle={socialIconFilter} />
              <span className={cardTextClass}><span className="block text-sm text-neutral-500">Facebook</span><span className={primaryLineClass}>luxride.eg</span></span>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={contactCardClass} aria-label="LuxRide on Instagram">
              <SocialLogoCircle src={SOCIAL_LOGOS.instagram} alt="" className="h-5 w-5" imgClassName="max-h-5 max-w-5" imgStyle={socialIconFilter} />
              <span className={cardTextClass}><span className="block text-sm text-neutral-500">Instagram</span><span className={primaryLineClass}>luxride.eg</span></span>
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <form onSubmit={submit} noValidate className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
              <h2 className="text-lux-charcoal" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("Send us a message", "أرسل لنا رسالة")}</h2>
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name" className="text-sm text-neutral-700">{L("Your name", "اسمك")}</Label>
                  <Input id="contact-name" required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email" className="text-sm text-neutral-700">{L("Your email (optional)", "بريدك الإلكتروني (اختياري)")}</Label>
                  <Input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-sm text-neutral-700">{L("Message", "الرسالة")}</Label>
                  <Textarea id="contact-message" required value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28" />
                </div>
                {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lux-orange">
                  <WhatsAppIcon className="h-4 w-4" /> {L("Send via WhatsApp", "إرسال عبر واتساب")}
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <h3 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.15rem" }}><MapPin className="h-5 w-5 text-lux-green" /> {L("Service area", "منطقة الخدمة")}</h3>
                <p className="mt-3 text-sm text-neutral-500" style={{ lineHeight: 1.7 }}>{L("Based in Hurghada, serving the Red Sea coast and destinations across Egypt including Luxor, Cairo, Aswan and Sharm El Sheikh.", "مقرنا الغردقة، ونخدم ساحل البحر الأحمر ووجهات عبر مصر تشمل الأقصر والقاهرة وأسوان وشرم الشيخ.")}</p>
              </div>
              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.15rem" }}>Tripadvisor</h3>
                <p className="mt-2 text-sm text-neutral-500">{L("View LuxRide's official Tripadvisor page.", "اطّلع على صفحة LuxRide الرسمية على Tripadvisor.")}</p>
                <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" aria-label="LuxRide official Tripadvisor page" className="mt-4 inline-flex items-center rounded-xl px-0 py-1 transition-all hover:opacity-80">
                  <TripadvisorLogoCircle />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
