import { useState } from "react";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageShell } from "../components/luxride/PageShell";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  TRIPADVISOR_URL,
  whatsappLink,
} from "../components/luxride/data";
import { useL } from "../components/luxride/i18n";

export function ContactPage() {
  const L = useL();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const body = `Name: ${name || "-"}\nEmail: ${email || "-"}\nMessage: ${message || "-"}`;

  const cards = [
    { icon: Phone, label: L("Phone", "الهاتف"), value: PHONE_DISPLAY, href: `tel:${PHONE_DISPLAY.replace(/\s/g, "")}` },
    { icon: MessageCircle, label: "WhatsApp", value: PHONE_DISPLAY, href: whatsappLink("Hello LuxRide!") },
    { icon: Mail, label: L("Email", "البريد الإلكتروني"), value: EMAIL ?? L("Pending client confirmation", "بانتظار تأكيد العميل"), href: EMAIL ? `mailto:${EMAIL}` : null },
  ];

  return (
    <PageShell
      crumb={L("Contact", "اتصل بنا")}
      title={L("Get in Touch", "تواصل معنا")}
      subtitle={L(
        "Our team is available around the clock to help you plan and confirm your transfer. Reach us the way that suits you best.",
        "فريقنا متاح على مدار الساعة لمساعدتك في تخطيط وتأكيد رحلتك. تواصل معنا بالطريقة التي تناسبك.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {cards.map((c) => c.href ? (
              <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:border-lux-green hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lux-green/12"><c.icon className="h-6 w-6 text-lux-green" /></div>
                <div>
                  <p className="text-sm text-neutral-500">{c.label}</p>
                  <p className="text-lux-charcoal">{c.value}</p>
                </div>
              </a>
            ) : (
              <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100"><c.icon className="h-6 w-6 text-neutral-400" /></div>
                <div><p className="text-sm text-neutral-500">{c.label}</p><p className="text-lux-charcoal">{c.value}</p></div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Contact form */}
            <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
              <h2 className="text-lux-charcoal" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("Send us a message", "أرسل لنا رسالة")}</h2>
              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutral-700">{L("Your name", "اسمك")}</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={L("Full name", "الاسم الكامل")} className="h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutral-700">{L("Email", "البريد الإلكتروني")}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-neutral-700">{L("Message", "الرسالة")}</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={L("How can we help?", "كيف يمكننا المساعدة؟")} className="min-h-28" />
                </div>
                <div>
                  <a href={whatsappLink(body)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-lux-green py-3 text-sm text-white transition-all hover:brightness-110">
                    <MessageCircle className="h-4 w-4" /> {L("Send via WhatsApp", "إرسال عبر واتساب")}
                  </a>
                  <p className="mt-2 text-center text-xs text-neutral-500">{L("Email contact will be enabled after the production address is confirmed.", "سيتم تفعيل التواصل بالبريد بعد تأكيد عنوان الإنتاج.")}</p>
                </div>
              </div>
            </div>

            {/* Info column */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <h3 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.15rem" }}><Clock className="h-5 w-5 text-lux-green" /> {L("Business hours", "ساعات العمل")}</h3>
                <p className="mt-3 text-sm text-neutral-500">{L("Final business hours are pending client confirmation. WhatsApp remains the current booking-enquiry channel.", "ساعات العمل النهائية بانتظار تأكيد العميل. يبقى واتساب قناة الاستفسار الحالية للحجز.")}</p>
              </div>

              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <h3 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.15rem" }}><MapPin className="h-5 w-5 text-lux-green" /> {L("Service area", "منطقة الخدمة")}</h3>
                <p className="mt-3 text-sm text-neutral-500">{L("Based in Hurghada, serving the Red Sea coast and destinations across Egypt including Luxor, Cairo, Aswan and Sharm El Sheikh.", "مقرنا الغردقة، ونخدم ساحل البحر الأحمر ووجهات عبر مصر تشمل الأقصر والقاهرة وأسوان وشرم الشيخ.")}</p>
                <div className="mt-4 flex h-32 items-center justify-center rounded-xl bg-lux-beige text-sm text-neutral-400">
                  {L("Service area map placeholder", "عنصر نائب لخريطة منطقة الخدمة")}
                </div>
              </div>

              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-7">
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.15rem" }}>{L("Follow us", "تابعنا")}</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {INSTAGRAM_URL ? <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-lux-charcoal/15 px-4 py-2 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green"><Instagram className="h-4 w-4" /> Instagram</a> : <span className="flex cursor-not-allowed items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400"><Instagram className="h-4 w-4" /> Instagram · {L("URL pending", "الرابط قيد الانتظار")}</span>}
                  {FACEBOOK_URL ? <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-lux-charcoal/15 px-4 py-2 text-sm text-lux-charcoal transition-all hover:border-lux-green hover:text-lux-green"><Facebook className="h-4 w-4" /> Facebook</a> : <span className="flex cursor-not-allowed items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-400"><Facebook className="h-4 w-4" /> Facebook · {L("URL pending", "الرابط قيد الانتظار")}</span>}
                  <a href={TRIPADVISOR_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-[#00aa6c]/50 px-4 py-2 text-sm text-[#00aa6c] transition-all hover:bg-[#00aa6c] hover:text-white">Tripadvisor</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
