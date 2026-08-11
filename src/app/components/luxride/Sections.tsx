import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  Droplet,
  Headphones,
  MapPinned,
  PlaneLanding,
  Send,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Usb,
  Users,
  Wallet,
  Wifi,
} from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  IMAGES,
  PHONE_DISPLAY,
  POPULAR_TRANSFERS,
  ROUTES,
  SELECTABLE_FLEET,
  availablePublicTripTypes,
  isVehicleSelectable,
  whatsappLink,
} from "./data";
import { locationLabel, useLang, t } from "./i18n";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { CLIENT_ACCENT_TEXT, CLIENT_ACCENT_YELLOW, CLIENT_STEP_NUMBER_BG } from "./brand";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  light = false,
  spacing = "default",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  spacing?: "default" | "tight";
}) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${spacing === "tight" ? "mb-8" : "mb-12"}`}>
      <span
        className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] ${light ? "text-lux-client-accent" : "text-lux-green"}`}
      >
        <span className={`h-px w-6 ${light ? "bg-lux-client-accent" : "bg-lux-green"}`} />
        {eyebrow}
        <span className={`h-px w-6 ${light ? "bg-lux-client-accent" : "bg-lux-green"}`} />
      </span>
      <h2
        className={light ? "text-white mt-3" : "text-lux-charcoal mt-3"}
        style={{
          fontFamily: "'Barlow Condensed', 'Cairo', sans-serif",
          fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 ${light ? "text-white/70" : "text-neutral-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function ServiceBenefits() {
  const lang = useLang();
  const L = (en: string, ar: string) => (lang === "AR" ? ar : en);

  const benefits = [
    { icon: ShieldCheck, en: "Private transportation", ar: "نقل خاص", den: "Your vehicle is exclusively yours — never shared.", dar: "سيارتك حصراً لك — بدون مشاركة أبداً." },
    { icon: Users, en: "Admission fee information where applicable", ar: "معلومات رسوم الدخول عند الحاجة", den: "Displayed or explained when applicable; not automatically included unless confirmed.", dar: "تُعرض أو تُوضّح عند الحاجة؛ غير مشمولة تلقائياً إلا بالتأكيد." },
    { icon: Snowflake, en: "Air-conditioned vehicle", ar: "سيارة مكيفة", den: "Cool, comfortable cabins in every season.", dar: "مقصورات باردة ومريحة في كل المواسم." },
    { icon: Droplet, en: "Complimentary bottled water", ar: "مياه معبأة مجاناً", den: "Chilled bottled water on board for every guest.", dar: "مياه معبأة باردة على متن السيارة لكل ضيف." },
    { icon: Wifi, en: "WiFi on board", ar: "واي فاي داخل السيارة", den: "Stay connected throughout your transfer.", dar: "ابقَ متصلاً طوال توصيلتك." },
    { icon: Usb, en: "USB Type-A/C charging", ar: "شحن USB نوع A/C", den: "Front and rear charging ports for all devices.", dar: "منافذ شحن أمامية وخلفية لكل الأجهزة." },
    { icon: PlaneLanding, en: "Real-time flight monitoring", ar: "متابعة الرحلات الجوية", den: "We track arrivals and adjust pickup for delays.", dar: "نتابع الوصول ونعدّل الاستلام عند التأخير." },
    { icon: Wallet, en: "Fixed transparent prices", ar: "أسعار ثابتة وشفافة", den: "The price you see is the price you pay — no hidden fees.", dar: "السعر الذي تراه هو ما تدفعه — بلا رسوم خفية." },
    { icon: BadgeCheck, en: "English-speaking drivers", ar: "سائقون يتحدثون الإنجليزية", den: "Professional, licensed and courteous chauffeurs.", dar: "سائقون محترفون مرخصون وذوو أخلاق رفيعة." },
  ];

  return (
    <section className="bg-lux-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={L("What's Included", "ما هو مشمول")}
          title={L("Premium Comfort, Included", "راحة فاخرة، مشمولة")}
          subtitle={L("Every LuxRide transfer comes with the details that make the ride effortless.", "كل توصيلة من LuxRide تأتي بالتفاصيل التي تجعل تنقلك سلساً.")}
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.en} className="flex gap-4 rounded-2xl border border-lux-charcoal/8 bg-white p-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lux-green/12">
                <b.icon className="h-5 w-5 text-lux-green" />
              </div>
              <div>
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.05rem" }}>{L(b.en, b.ar)}</h3>
                <p className="mt-1 text-sm text-neutral-500">{L(b.den, b.dar)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LastMinute() {
  const lang = useLang();
  const isAR = lang === "AR";
  return (
    <section className="border-y border-[#ffcc00]/35 bg-[#FBF5EF] py-10">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex flex-col items-start gap-5 rounded-2xl border border-[#ffcc00]/45 bg-white px-6 py-7 shadow-[0_4px_20px_rgba(0,0,0,0.06)] md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <span
              className="inline-block rounded-full px-4 py-1 text-xs uppercase tracking-wider"
              style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT, fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif", fontWeight: 700 }}
              data-last-minute-accent="badge"
            >
              {t(lang, "lm_title")}
            </span>
            <h3
              className="mt-3 text-lux-charcoal"
              style={{
                fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif",
                fontSize: "1.35rem",
                fontWeight: 700,
              }}
            >
              {isAR ? "هل تحتاج إلى توصيلة خلال أقل من 3 ساعات؟" : "Need a transfer within 3 hours?"}
            </h3>
            <p className="mt-1 max-w-xl text-gray-600 text-sm" style={{ lineHeight: 1.6 }}>
              {isAR
                ? "تتطلب الحجوزات العادية وجود فاصل زمني لا يقل عن 3 ساعات قبل موعد التحرك. للحجوزات العاجلة، تواصل معنا مباشرة عبر واتساب للتحقق من الإتاحة."
                : "Standard online bookings require at least three hours before pickup. For a last-minute request, contact LuxRide directly through WhatsApp to check availability."}
            </p>
          </div>
          <div className="shrink-0 text-center">
            <a
              href={whatsappLink("Hi LuxRide, I'd like to check last-minute availability for today.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-medium transition-all hover:brightness-105"
              style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem" }}
              data-last-minute-accent="button"
            >
              <WhatsAppIcon className="h-5 w-5" /> {t(lang, "lm_cta")}
            </a>
            <span className="mt-2 block text-sm font-semibold text-lux-charcoal" dir="ltr">{PHONE_DISPLAY}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PopularTransfers() {
  const lang = useLang();
  const imagePositionFor = (transferId: string, image: string) => {
    if (transferId === "hurghada-city-airport") return "center 72%";
    if (image === IMAGES.hurghada) return "center 72%";
    return "center";
  };

  return (
    <section id="transfers" className="bg-lux-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "pop_eyebrow")}
          title={t(lang, "pop_title")}
          subtitle={t(lang, "pop_sub")}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_TRANSFERS.map((tr) => {
            const imagePosition = imagePositionFor(tr.id, tr.image);
            return (
            <div
              key={tr.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]"
            >
              <div className="relative h-52 overflow-hidden bg-white">
                <ImageWithFallback
                  src={tr.image}
                  alt={`${tr.displayFrom?.[lang] ?? locationLabel(lang, tr.from)} to ${tr.displayTo?.[lang] ?? locationLabel(lang, tr.to)}`}
                  className="popular-transfer-image h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: "none", opacity: 1, mixBlendMode: "normal", objectPosition: imagePosition }}
                />
                {tr.discountPct && (
                  <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs" style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT }}>
                    {tr.discountPct}% OFF
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-lux-bronze">{tr.displayFrom?.[lang] ?? locationLabel(lang, tr.from)}</p>
                <div className="mt-1 flex items-start justify-between gap-4">
                  <h3 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.25rem" }}>
                    {tr.displayTo?.[lang] ?? locationLabel(lang, tr.to)}
                  </h3>
                  <div className="shrink-0 text-end">
                    {tr.oldPrice && <p className="text-xs text-neutral-400 line-through">€{tr.oldPrice}</p>}
                    <p className="text-sm font-bold text-lux-green">{lang === "AR" ? "من" : "from"} €{tr.fromPrice}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-lux-green" /> {tr.duration}
                  </span>
                  {tr.airport && <span className="rounded-full bg-lux-green/10 px-2 py-0.5 text-xs text-lux-green">+€2 airport fee</span>}
                  {tr.permit && <span className="rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG, color: CLIENT_ACCENT_TEXT }}>+ travel permit</span>}
                </div>
                <Link
                  to={`/booking?${new URLSearchParams({ from: tr.from, to: tr.to, trip: "oneWay" }).toString()}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-full bg-lux-green py-2.5 text-sm text-white transition-all hover:brightness-110"
                >
                  {t(lang, "pop_book")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Fleet() {
  const lang = useLang();

  return (
    <section id="fleet" className="bg-white py-14 md:py-18">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "fleet_eyebrow")}
          title={t(lang, "fleet_title")}
          subtitle={t(lang, "fleet_sub")}
        />
        <div
          className="flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:var(--lux-green)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-lux-green/45 [&::-webkit-scrollbar-track]:bg-transparent"
          data-homepage-fleet-feed="horizontal"
        >
          {SELECTABLE_FLEET.map((v) => (
            <div
              key={v.id}
              className={`flex max-h-[34rem] min-w-[82%] snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)] transition-all sm:min-w-[24rem] lg:min-w-[calc((100%_-_2.5rem)_/_3)] lg:basis-[calc((100%_-_2.5rem)_/_3)] lg:max-w-[calc((100%_-_2.5rem)_/_3)] ${
                isVehicleSelectable(v) ? "border-lux-green/30 hover:border-lux-green/60" : "border-neutral-200 opacity-70"
              }`}
            >
              <div className="relative h-48 overflow-hidden bg-white">
                <ImageWithFallback
                  src={v.image}
                  alt={v.name}
                  className="h-full w-full object-contain p-3"
                  style={{ direction: "ltr" }}
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs ${
                    isVehicleSelectable(v) ? "bg-lux-green text-white" : "bg-lux-charcoal/90 text-lux-beige/80"
                  }`}
                >
                  {isVehicleSelectable(v) ? t(lang, "fleet_available") : t(lang, "fleet_soon")}
                </span>
                <span className="absolute right-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-bold" style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT }} data-fleet-type-badge="client-accent">
                  {lang === "AR" ? v.categoryAr : v.category}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-6 [scrollbar-width:thin]" data-vehicle-card-scroll="y">
                <div className="flex items-center justify-between">
                  <h3 className="text-lux-charcoal" style={{ fontSize: "1.25rem" }}>{v.name}</h3>
                  <Sparkles className="h-4 w-4 text-lux-client-accent" />
                </div>
                <p className="mt-1 min-h-10 text-sm text-neutral-500">{lang === "AR" ? v.taglineAr : v.tagline}</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                  <span className="col-span-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-lux-green" /> {lang === "AR" ? v.capacityAr : v.capacityEn}
                  </span>
                  <span className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-lux-green" /> {t(lang, "fleet_ac")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Wifi className={`h-4 w-4 ${v.wifi ? "text-lux-green" : "text-neutral-300"}`} /> WiFi
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
                  <span className="text-sm text-neutral-500">{t(lang, "fleet_price")}</span>
                  {isVehicleSelectable(v) ? (
                    <Link
                      to={`/booking?vehicle=${v.id}`}
                      className="rounded-full bg-lux-green px-5 py-2 text-sm text-white transition-all hover:brightness-110"
                    >
                      {t(lang, "fleet_select")}
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-full border border-neutral-200 px-5 py-2 text-sm text-neutral-400">
                      {t(lang, "fleet_soon")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const REASON_KEYS = [
  { icon: Wallet, title: "r1_title" as const, text: "r1_text" as const },
  { icon: ShieldCheck, title: "r2_title" as const, text: "r2_text" as const },
  { icon: BadgeCheck, title: "r3_title" as const, text: "r3_text" as const },
  { icon: PlaneLanding, title: "r4_title" as const, text: "r4_text" as const },
  { icon: Headphones, title: "r5_title" as const, text: "r5_text" as const },
  { icon: Sparkles, title: "r6_title" as const, text: "r6_text" as const },
  { icon: CreditCard, title: "r7_title" as const, text: "r7_text" as const },
  { icon: WhatsAppIcon, title: "r8_title" as const, text: "r8_text" as const },
];

export function WhyChoose() {
  const lang = useLang();

  return (
    <section className="bg-lux-beige pt-4 pb-14 md:pt-6 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "why_eyebrow")}
          title={t(lang, "why_title")}
          spacing="tight"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASON_KEYS.map((r) => (
            <div
              key={r.title}
              className="flex h-full flex-col rounded-2xl border border-lux-charcoal/8 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG }}>
                <r.icon className="h-6 w-6 text-lux-bronze" />
              </div>
              <h3 className="mt-4 text-lux-charcoal" style={{ fontSize: "1.05rem" }}>
                {t(lang, r.title)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{t(lang, r.text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  const lang = useLang();

  return (
    <section id="about" className="bg-lux-dark py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 md:px-8 lg:grid-cols-2">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <ImageWithFallback
              src={IMAGES.driver}
              alt="Professional LuxRide chauffeur"
              className="h-[420px] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-2xl border border-lux-client-accent/35 bg-lux-dark-2 px-6 py-5 shadow-2xl sm:right-8">
            <p className="text-lux-client-accent" style={{ fontSize: "2.25rem", fontWeight: 700 }}>
              {lang === "AR" ? "نقل خاص" : "Private"}
            </p>
            <p className="text-sm text-lux-beige/70">{t(lang, "about_stat")}</p>
          </div>
        </div>
        <div>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-lux-client-accent">
            <span className="h-px w-6 bg-lux-client-accent" /> {t(lang, "about_eyebrow")}
          </span>
          <h2
            className="mt-4 text-lux-beige"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.1 }}
          >
            {t(lang, "about_title")}
          </h2>
          <p className="mt-6 text-lux-beige/75" style={{ lineHeight: 1.7 }}>
            {t(lang, "about_text")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/booking"
              className="rounded-full px-7 py-3 transition-all hover:brightness-105"
              style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT }}
            >
              {t(lang, "about_book")}
            </Link>
            <a
              href={whatsappLink("Hi LuxRide, I have a question about your services.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-lux-beige/25 px-7 py-3 text-lux-beige transition-all hover:border-lux-client-accent hover:text-lux-client-accent"
            >
              <WhatsAppIcon className="h-4 w-4" /> {t(lang, "about_wa")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DestinationSEO() {
  const lang = useLang();
  const featuredRoutes = ROUTES.filter((route) => ["a2", "a10", "l1", "l4", "l7", "l8"].includes(route.id));

  return (
    <section id="destinations" className="bg-lux-beige py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t(lang, "dest_eyebrow")}
          title={t(lang, "dest_title")}
          subtitle={t(lang, "dest_sub")}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRoutes.map((route) => {
            const publicTrip = availablePublicTripTypes(route)[0];
            const startingPrice = Math.min(...Object.values(route.prices).filter((value): value is number => typeof value === "number"));
            const query = new URLSearchParams({ from: route.from, to: route.to, trip: publicTrip }).toString();
            return (
              <article key={route.id} className="overflow-hidden rounded-2xl border border-lux-charcoal/8 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.06)]">
                <ImageWithFallback src={route.image ?? IMAGES.hurghada} alt={locationLabel(lang, route.to)} className="h-44 w-full object-cover" style={{ objectPosition: route.image === IMAGES.hurghada ? "center 72%" : "center" }} />
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-lux-bronze">{locationLabel(lang, route.from)}</p>
                  <h3 className="mt-1 text-lux-charcoal" style={{ fontSize: "1.25rem" }}>{locationLabel(lang, route.to)}</h3>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-neutral-600">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-lux-green" />{route.duration}</span>
                    <span className="rounded-full bg-lux-green/10 px-2.5 py-0.5 text-lux-green">{lang === "AR" ? "يبدأ من" : "From"} €{startingPrice}</span>
                    {route.airport && <span className="rounded-full bg-lux-green/10 px-2.5 py-0.5 text-xs text-lux-green">+€2 {lang === "AR" ? "رسوم مطار" : "airport fee"}</span>}
                    {route.permit && <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG, color: CLIENT_ACCENT_TEXT }}>+ {lang === "AR" ? "تصريح سفر" : "travel permit"}</span>}
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Link to={`/transfer-details?${query}`} className="flex flex-1 items-center justify-center rounded-full border border-lux-charcoal/15 py-2.5 text-sm text-lux-charcoal hover:border-lux-green hover:text-lux-green">
                      {lang === "AR" ? "عرض التوصيلة" : "View Transfer"}
                    </Link>
                    <Link to={`/booking?${query}`} className="flex flex-1 items-center justify-center rounded-full bg-lux-green py-2.5 text-sm text-white hover:brightness-110">
                      {lang === "AR" ? "احجز الآن" : "Book Now"}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const lang = useLang();
  const isAR = lang === "AR";

  const steps = [
    {
      num: "01",
      Icon: MapPinned,
      en: { title: "Choose Your Route", desc: "Select your pickup, destination, trip type, date, and preferred vehicle." },
      ar: { title: "اختر مسارك", desc: "اختر موقع الانطلاق والوجهة ونوع التوصيلة والتاريخ والسيارة المناسبة." },
    },
    {
      num: "02",
      Icon: Calculator,
      en: { title: "Check Your Price", desc: "Review the fixed route price, discounts, and any clearly displayed applicable fees." },
      ar: { title: "راجع سعرك", desc: "راجع السعر الثابت للمسار والخصومات وأي رسوم مطبقة معروضة بوضوح." },
    },
    {
      num: "03",
      Icon: Send,
      en: { title: "Send Your Booking", desc: "Complete your information and send one booking request." },
      ar: { title: "أرسل طلب الحجز", desc: "أكمل معلوماتك وأرسل طلب حجز واحداً واضحاً." },
    },
    {
      num: "04",
      Icon: CheckCircle2,
      en: { title: "Receive Confirmation", desc: "LuxRide confirms the vehicle, driver, pickup time, and transfer details." },
      ar: { title: "استلم التأكيد", desc: "تؤكد LuxRide السيارة والسائق ووقت الاستلام وتفاصيل التوصيلة." },
    },
  ];

  return (
    <section className="bg-lux-beige py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.25em] text-lux-green">
            <span className="h-px w-6 bg-lux-green" />
            {isAR ? "كيف يعمل" : "Simple Process"}
            <span className="h-px w-6 bg-lux-green" />
          </span>
          <h2
            className="mt-3 text-lux-charcoal"
            style={{
              fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {isAR ? "كيف يعمل LuxRide" : "How It Works"}
          </h2>
        </div>

        <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute top-10 hidden h-px bg-lux-green/25 lg:block"
                  style={isAR ? { right: "calc(50% + 2.5rem)", left: "-50%" } : { left: "calc(50% + 2.5rem)", right: "-50%" }}
                />
              )}
              {i < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute bottom-[-1.25rem] top-[4.9rem] start-8 w-px bg-lux-green/20 sm:hidden"
                />
              )}
              <div className="relative h-full rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:text-center">
                <div className="mb-4 flex items-center gap-4 sm:flex-col sm:gap-3">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-white bg-lux-green/10 shadow-sm">
                    <s.Icon className="h-7 w-7 text-lux-green" aria-hidden="true" />
                    <span className="absolute -end-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-[0.68rem] font-bold" style={{ backgroundColor: CLIENT_STEP_NUMBER_BG, color: CLIENT_ACCENT_TEXT }} data-how-it-works-step-number="client-accent-35">
                      {s.num}
                    </span>
                  </div>
                  <span
                    className="text-lux-green/70"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em" }}
                  >
                    {isAR ? `الخطوة ${s.num}` : `STEP ${s.num}`}
                  </span>
                </div>
                <h3
                  className="text-lux-charcoal"
                  style={{
                    fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                  }}
                >
                  {isAR ? s.ar.title : s.en.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500" style={{ lineHeight: 1.6 }}>
                  {isAR ? s.ar.desc : s.en.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const lang = useLang();

  return (
    <section className="relative overflow-hidden bg-lux-dark py-24">
      <div className="absolute inset-0 opacity-20">
        <ImageWithFallback
          src={IMAGES.luxor}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-lux-dark/80" />
      <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
        <h2
          className="text-white"
          style={{ fontFamily: "'Barlow Condensed', 'Cairo', sans-serif", fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1 }}
        >
          {t(lang, "cta_title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lux-beige/75" style={{ fontSize: "1.1rem" }}>
          {t(lang, "cta_sub")}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            to="/booking"
            className="rounded-full px-8 py-3.5 transition-all hover:brightness-105"
            style={{ backgroundColor: CLIENT_ACCENT_YELLOW, color: CLIENT_ACCENT_TEXT }}
          >
            {t(lang, "cta_calc")}
          </Link>
          <a
            href={whatsappLink("Hello LuxRide, I'd like to book a transfer.")}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-lux-beige/30 px-8 py-3.5 text-lux-beige transition-all hover:border-lux-client-accent hover:text-lux-client-accent"
          >
            <WhatsAppIcon className="h-5 w-5" /> {t(lang, "cta_wa")}
          </a>
        </div>
      </div>
    </section>
  );
}
