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

  return (
    <PageShell
      crumb={L("Contact", "اتصل بنا")}
      title={L("Get in Touch", "تواصل معنا")}
      subtitle={L(
        "Plan your transfer with LuxRide by phone or WhatsApp.",
        "خطّط لتوصيلتك مع LuxRide عبر الهاتف أو واتساب.",
      )}
      tone="brand"
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-lux-green hover:shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lux-green/12"><Phone className="h-6 w-6 text-lux-green" /></span>
              <span><span className="block text-sm text-neutral-500">{L("Phone", "الهاتف")}</span><span className="text-lux-charcoal" dir="ltr">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-lux-green hover:shadow-lg">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-lux-green/10"><Mail className="h-6 w-6 text-lux-green" /></span>
              <span><span className="block text-sm text-neutral-500">{L("Email", "البريد الإلكتروني")}</span><span className="text-lux-charcoal" dir="ltr">{EMAIL}</span></span>
            </a>
            <a href={whatsappLink("Hello LuxRide!")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-lux-green hover:shadow-lg">
              <SocialLogoCircle src={SOCIAL_LOGOS.whatsapp} alt="WhatsApp" />
              <span><span className="block text-sm text-neutral-500">WhatsApp</span><span className="text-lux-charcoal" dir="ltr">{PHONE_DISPLAY}</span></span>
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-[#1877f2] hover:shadow-lg" aria-label="LuxRide on Facebook">
              <SocialLogoCircle src={SOCIAL_LOGOS.facebook} alt="Facebook" />
              <span><span className="block text-sm text-neutral-500">Facebook</span><span className="text-lux-charcoal">luxride.eg</span></span>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-[#e4405f] hover:shadow-lg" aria-label="LuxRide on Instagram">
              <SocialLogoCircle src={SOCIAL_LOGOS.instagram} alt="Instagram" />
              <span><span className="block text-sm text-neutral-500">Instagram</span><span className="text-lux-charcoal">luxride.eg</span></span>
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
                <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-3 rounded-full bg-lux-beige px-4 py-2.5 text-sm text-lux-charcoal transition-all hover:bg-white">
                  <TripadvisorLogoCircle /> Tripadvisor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
