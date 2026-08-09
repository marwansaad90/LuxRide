import { createContext, useContext } from "react";

export type Lang = "EN" | "AR";

export const LangContext = createContext<Lang>("EN");
export const useLang = () => useContext(LangContext);

const ARABIC_LOCATION_LABELS: Record<string, string> = {
  "Hurghada Airport": "مطار الغردقة",
  Hurghada: "الغردقة",
  "El Gouna": "الجونة",
  "Sahl Hasheesh": "سهل حشيش",
  "Soma Bay": "سوما باي",
  "Makadi Bay": "مكادي باي",
  Safaga: "سفاجا",
  Nefertari: "نفرتاري",
  "El Quseir": "القصير",
  "Marsa Ghaleb": "مرسى غالب",
  "Marsa Alam": "مرسى علم",
  Hamata: "حماطة",
  "City Tour – Alf Leila": "جولة المدينة – ألف ليلة",
  "Sharm El Naga": "شرم النجع",
  "Al Ahyaa": "الأحياء",
  "Village Road": "طريق القرى",
  "Wadi El Gemal": "وادي الجمال",
  "Abu Dabbab": "أبو دباب",
  "Sharm El Luli": "شرم اللولي",
  "El Qulaan": "القلعان",
  "Alf Leila": "ألف ليلة وليلة",
  "Ain Sokhna": "العين السخنة",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  Cairo: "القاهرة",
  Zaafarana: "الزعفرانة",
  Alexandria: "الإسكندرية",
  "Sharm El Sheikh": "شرم الشيخ",
};

export function locationLabel(lang: Lang, value: string): string {
  return lang === "AR" ? (ARABIC_LOCATION_LABELS[value] ?? value) : value;
}

// ─── Translation map ───────────────────────────────────────────────────────────
const T = {
  EN: {
    // Header nav
    nav_home: "Home",
    nav_transfers: "Transfers",
    nav_destinations: "Destinations",
    nav_fleet: "Our Fleet",
    nav_featured: "Unforgettable Experiences",
    nav_about: "About Us",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    nav_booking: "Book Now",
    nav_faq: "FAQ",
    book_your_transfer: "Book Your Transfer",

    // Hero
    hero_badge: "Hurghada · Egypt",
    hero_h1_1: "Premium Private",
    hero_h1_2: "Transfers in",
    hero_h1_3: "Hurghada",
    hero_sub: "Reliable airport transfers, private limousine services, and comfortable transfers across Hurghada and Egypt.",
    hero_cta1: "Book Your Transfer",
    hero_cta2: "View Our Fleet",
    hero_feat: "Fixed, transparent prices",

    // Booking calculator
    calc_title: "Instant Price Calculator",
    calc_pickup: "Pickup Location",
    calc_dest: "Destination",
    calc_date: "Transfer Date",
    calc_time: "Pickup Time",
    calc_pax: "Passengers",
    calc_pax_1: "passenger",
    calc_pax_n: "passengers",
    calc_vehicle: "Vehicle Type",
    calc_oneway: "One Way",
    calc_name: "Your Name",
    calc_name_ph: "Full name",
    calc_phone: "WhatsApp Number",
    calc_phone_ph: "+20 ...",
    calc_price_lbl: "Your transfer price",
    calc_oneway_note: "One way · fixed price",
    calc_upto: "Up to",
    calc_luggage: "luggage",
    calc_book_wa: "Send Booking Request",
    calc_book_email: "Send Booking Request",
    calc_confirm: "Your booking request will be reviewed and confirmed shortly.",

    // Booking calculator — extended
    calc_overday: "Round Route classification",
    calc_overnight: "Round Route classification",
    calc_oneway_desc: "Single transfer",
    calc_overday_desc: "Same-day return",
    calc_overnight_desc: "Later-date return",
    calc_hotel: "Hotel / Exact Destination",
    calc_hotel_ph: "e.g. Steigenberger Al Dau, El Gouna",
    calc_room: "Room Number (optional)",
    calc_room_ph: "e.g. 214",
    calc_room_note: "Adding your room number helps us coordinate your pickup more efficiently.",
    calc_email: "Email Address",
    calc_email_ph: "you@example.com",
    calc_flight: "Flight Number",
    calc_flight_ph: "e.g. MS763",
    calc_flight_note: "We monitor your flight in real time and adjust the pickup time in case of delays or early arrival.",
    calc_passport: "Passport / ID Number",
    calc_passport_ph: "Required for the travel permit",
    calc_notes: "Notes (optional)",
    calc_notes_ph: "Anything we should know?",
    calc_return_date: "Return Date",
    calc_return_time: "Return Time",
    calc_luggage_lbl: "Luggage items",
    calc_cutoff_err: "This transfer must be booked at least 3 hours before departure. Please use Last-minute Booking on WhatsApp.",
    calc_permit_notice: "This transfer requires an official tourism and security travel permit. LuxRide can arrange the required permit on your behalf.",

    // Price summary
    sum_title: "Price Summary",
    sum_trip: "Transfer type",
    sum_route: "Route",
    sum_vehicle: "Vehicle",
    sum_base: "Base transfer price",
    sum_discount: "Discount",
    sum_airport: "Airport operating surcharge",
    sum_permit: "Travel permit",
    sum_overnight: "Driver overnight accommodation",
    sum_total: "Final total",

    // Last-minute booking
    lm_title: "Last-minute Booking",
    lm_text: "Standard online bookings require at least three hours before pickup. For a last-minute request, contact LuxRide directly through WhatsApp to check availability.",
    lm_cta: "Check Last-minute Availability on WhatsApp",

    // Popular Transfers
    pop_eyebrow: "Popular Routes",
    pop_title: "Most Requested Transfers",
    pop_sub: "Fixed, transparent prices for the routes our guests book most.",
    pop_pax: "1–14 pax",
    pop_book: "Book Now",

    // Fleet
    fleet_eyebrow: "Our Fleet",
    fleet_title: "Choose Your Vehicle",
    fleet_sub: "Modern, air-conditioned and immaculately maintained — for every group size.",
    fleet_ac: "Air conditioning",
    fleet_private: "Private transfer",
    fleet_price: "Price based on route",
    fleet_select: "Select",
    fleet_available: "Available",
    fleet_soon: "Coming Soon",

    // WhyChoose
    why_eyebrow: "Why LuxRide",
    why_title: "Travel With Complete Confidence",

    // Reasons (WhyChoose cards)
    r1_title: "Fixed & Transparent Prices",
    r1_text: "The price you see is the price you pay — always.",
    r2_title: "Private Transfers",
    r2_text: "Your vehicle is exclusively yours, no sharing.",
    r3_title: "Professional Drivers",
    r3_text: "Licensed, experienced and courteous chauffeurs.",
    r4_title: "Flight Monitoring",
    r4_text: "We track your flight and adjust for delays.",
    r5_title: "Responsive Booking Help",
    r5_text: "Get clear help before and during your trip.",
    r6_title: "Clean & Comfortable",
    r6_text: "Spotless, well-maintained, air-conditioned cars.",
    r7_title: "No Hidden Charges",
    r7_text: "No surprise fees, tolls or extra costs.",
    r8_title: "Easy WhatsApp Confirmation",
    r8_text: "Confirm your booking in just a few messages.",

    // About
    about_eyebrow: "About LuxRide",
    about_title: "Your Trusted Transfer Partner in Egypt",
    about_text: "LuxRide provides reliable, comfortable, and professionally managed private transfers for visitors to Hurghada and Egypt. From airport pickups to long-distance transfers, every request is arranged with attention to safety, timing, and guest comfort.",
    about_book: "Book a Transfer",
    about_wa: "Chat on WhatsApp",
    about_stat: "Private transfer service",

    // Destination SEO
    dest_eyebrow: "Destinations We Serve",
    dest_title: "Private Transfers Across Egypt",
    dest_sub: "Explore our dedicated transfer services for every major destination.",
    dest_1: "Hurghada Airport Transfers",
    dest_2: "El Gouna Transfers",
    dest_3: "Makadi Bay Transfers",
    dest_4: "Soma Bay Transfers",
    dest_5: "Sahl Hasheesh Transfers",
    dest_6: "Luxor Private Transfers",
    dest_7: "Marsa Alam Transfers",

    // Final CTA
    cta_title: "Ready to Book Your Private Transfer?",
    cta_sub: "Choose your route and vehicle, review the price, and send one clear booking request.",
    cta_calc: "Calculate Your Price",
    cta_wa: "Contact Us on WhatsApp",

    // FAQ
    faq_eyebrow: "Good to Know",
    faq_title: "Frequently Asked Questions",

    // Footer
    footer_desc: "Premium private limousine and tourist transfer service in Hurghada, Egypt. Reliable, comfortable and professionally managed transfers.",
    footer_quick: "Quick Links",
    footer_dests: "Popular Destinations",
    footer_contact: "Contact",
    footer_addr: "Hurghada, Red Sea, Egypt",
    footer_wa: "WhatsApp us",
    footer_copy: "LuxRide Taxi. All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms",
    footer_cancellation: "Cancellation Policy",

    // Sticky
    sticky_book: "Book Now",
  },

  AR: {
    // Header nav
    nav_home: "الرئيسية",
    nav_transfers: "توصيلات المطار",
    nav_destinations: "الوجهات",
    nav_fleet: "أسطول السيارات",
    nav_featured: "تجارب لا تُنسى",
    nav_about: "من نحن",
    nav_reviews: "التقييمات",
    nav_contact: "اتصل بنا",
    nav_booking: "احجز الآن",
    nav_faq: "الأسئلة الشائعة",
    book_your_transfer: "احجز توصيلة",

    // Hero
    hero_badge: "الغردقة · مصر",
    hero_h1_1: "توصيلات خاصة",
    hero_h1_2: "فاخرة في",
    hero_h1_3: "الغردقة",
    hero_sub: "توصيلات مطار موثوقة، خدمات ليموزين خاصة، وتوصيلات مريحة عبر الغردقة ومصر.",
    hero_cta1: "احجز توصيلة",
    hero_cta2: "استعرض أسطولنا",
    hero_feat: "أسعار ثابتة وشفافة",

    // Booking calculator
    calc_title: "حاسبة الأسعار الفورية",
    calc_pickup: "موقع الاستلام",
    calc_dest: "الوجهة",
    calc_date: "تاريخ النقل",
    calc_time: "وقت الاستلام",
    calc_pax: "عدد الركاب",
    calc_pax_1: "راكب",
    calc_pax_n: "ركاب",
    calc_vehicle: "نوع السيارة",
    calc_oneway: "ذهاب فقط",
    calc_name: "اسمك",
    calc_name_ph: "الاسم الكامل",
    calc_phone: "رقم واتساب",
    calc_phone_ph: "+20 ...",
    calc_price_lbl: "سعر النقل الخاص بك",
    calc_oneway_note: "ذهاب فقط · سعر ثابت",
    calc_upto: "حتى",
    calc_luggage: "حقيبة",
    calc_book_wa: "احجز الآن عبر واتساب",
    calc_book_email: "إرسال الحجز عبر البريد الإلكتروني",
    calc_confirm: "سيتم مراجعة طلب حجزك وتأكيده قريباً.",

    // Booking calculator — extended
    calc_overday: "تصنيف رحلة الذهاب والعودة",
    calc_overnight: "تصنيف رحلة الذهاب والعودة",
    calc_oneway_desc: "توصيلة ذهاب واحدة",
    calc_overday_desc: "عودة في نفس اليوم",
    calc_overnight_desc: "عودة في يوم لاحق",
    calc_hotel: "الفندق / الوجهة الدقيقة",
    calc_hotel_ph: "مثال: شتيجنبرجر الداو، الجونة",
    calc_room: "رقم الغرفة (اختياري)",
    calc_room_ph: "مثال: ٢١٤",
    calc_room_note: "إضافة رقم غرفتك تساعدنا على تنسيق استلامك بكفاءة أكبر.",
    calc_email: "البريد الإلكتروني",
    calc_email_ph: "you@example.com",
    calc_flight: "رقم الرحلة الجوية",
    calc_flight_ph: "مثال: MS763",
    calc_flight_note: "نتابع رحلتك في الوقت الفعلي ونعدّل موعد الاستلام في حالة التأخير أو الوصول المبكر.",
    calc_passport: "رقم جواز السفر / الهوية",
    calc_passport_ph: "مطلوب لتصريح السفر",
    calc_notes: "ملاحظات (اختياري)",
    calc_notes_ph: "هل هناك ما يجب أن نعرفه؟",
    calc_return_date: "تاريخ العودة",
    calc_return_time: "وقت العودة",
    calc_luggage_lbl: "عدد الحقائب",
    calc_cutoff_err: "يجب حجز هذه التوصيلة قبل ٣ ساعات على الأقل من موعد المغادرة. الرجاء استخدام الحجز اللحظي عبر واتساب.",
    calc_permit_notice: "تتطلب هذه التوصيلة تصريح سفر سياحي وأمني رسمي. يمكن لـ LuxRide ترتيب التصريح المطلوب نيابةً عنك.",

    // Price summary
    sum_title: "ملخص السعر",
    sum_trip: "نوع التوصيلة",
    sum_route: "المسار",
    sum_vehicle: "السيارة",
    sum_base: "سعر النقل الأساسي",
    sum_discount: "الخصم",
    sum_airport: "رسوم تشغيل المطار",
    sum_permit: "تصريح السفر",
    sum_overnight: "مبيت السائق",
    sum_total: "الإجمالي النهائي",

    // Last-minute booking
    lm_title: "الحجز اللحظي",
    lm_text: "تتطلب الحجوزات العادية وجود فاصل زمني لا يقل عن 3 ساعات قبل موعد التحرك. للحجوزات العاجلة، تواصل معنا مباشرة عبر واتساب للتحقق من الإتاحة.",
    lm_cta: "تحقق من التوفر اللحظي عبر واتساب",

    // Popular Transfers
    pop_eyebrow: "المسارات الشائعة",
    pop_title: "أكثر التوصيلات طلباً",
    pop_sub: "أسعار ثابتة وشفافة للمسارات الأكثر حجزاً من ضيوفنا.",
    pop_pax: "١–١٤ راكب",
    pop_book: "احجز الآن",

    // Fleet
    fleet_eyebrow: "أسطولنا",
    fleet_title: "اختر سيارتك",
    fleet_sub: "حديثة، مكيفة الهواء، ومُصانة بعناية — لكل حجم مجموعة.",
    fleet_ac: "تكييف هواء",
    fleet_private: "نقل خاص",
    fleet_price: "السعر حسب المسار",
    fleet_select: "اختر",
    fleet_available: "متاح",
    fleet_soon: "قريباً",

    // WhyChoose
    why_eyebrow: "لماذا LuxRide",
    why_title: "سافر بكل ثقة واطمئنان",

    // Reasons
    r1_title: "أسعار ثابتة وشفافة",
    r1_text: "السعر الذي تراه هو السعر الذي تدفعه — دائماً.",
    r2_title: "نقل خاص",
    r2_text: "السيارة حصراً لك، بدون مشاركة.",
    r3_title: "سائقون محترفون",
    r3_text: "سائقون مرخصون وذوو خبرة وأخلاق رفيعة.",
    r4_title: "متابعة الرحلات الجوية",
    r4_text: "نتابع رحلتك ونعدّل موعد الاستلام عند التأخير.",
    r5_title: "مساعدة سريعة للحجز",
    r5_text: "احصل على مساعدة واضحة قبل رحلتك وأثناءها.",
    r6_title: "نظيف ومريح",
    r6_text: "سيارات نظيفة جيدة الصيانة ومكيفة الهواء.",
    r7_title: "لا رسوم خفية",
    r7_text: "لا رسوم مفاجئة أو تكاليف إضافية.",
    r8_title: "تأكيد سهل عبر واتساب",
    r8_text: "أكّد حجزك بضع رسائل فقط.",

    // About
    about_eyebrow: "عن LuxRide",
    about_title: "شريكك الموثوق للنقل في مصر",
    about_text: "تقدم LuxRide خدمات نقل خاصة موثوقة ومريحة ومُدارة باحترافية لزوار الغردقة ومصر. من استقبال المطار إلى التوصيلات بعيدة المسافة، كل طلب مُنظم باهتمام بالسلامة والتوقيت وراحة الضيوف.",
    about_book: "احجز توصيلة",
    about_wa: "تحدث معنا على واتساب",
    about_stat: "خدمة نقل خاصة",

    // Destination SEO
    dest_eyebrow: "الوجهات التي نخدمها",
    dest_title: "توصيلات خاصة عبر مصر",
    dest_sub: "استكشف خدمات النقل المخصصة لدينا لكل وجهة رئيسية.",
    dest_1: "توصيلات مطار الغردقة",
    dest_2: "توصيلات الجونة",
    dest_3: "توصيلات مكادي باي",
    dest_4: "توصيلات سوما باي",
    dest_5: "توصيلات سهل حشيش",
    dest_6: "توصيلات الأقصر الخاصة",
    dest_7: "توصيلات مرسى علم",

    // Final CTA
    cta_title: "هل أنت مستعد لحجز توصيلة خاصة؟",
    cta_sub: "اختر مسارك وسيارتك، راجع السعر، وأرسل طلب حجز واحداً واضحاً.",
    cta_calc: "احسب سعرك",
    cta_wa: "تواصل معنا على واتساب",

    // FAQ
    faq_eyebrow: "معلومات مفيدة",
    faq_title: "الأسئلة الشائعة",

    // Footer
    footer_desc: "خدمة ليموزين خاصة فاخرة ونقل سياحي في الغردقة، مصر. توصيلات موثوقة ومريحة ومُدارة باحترافية.",
    footer_quick: "روابط سريعة",
    footer_dests: "الوجهات الشائعة",
    footer_contact: "اتصل بنا",
    footer_addr: "الغردقة، البحر الأحمر، مصر",
    footer_wa: "راسلنا على واتساب",
    footer_copy: "LuxRide Taxi. جميع الحقوق محفوظة.",
    footer_privacy: "سياسة الخصوصية",
    footer_terms: "الشروط والأحكام",
    footer_cancellation: "سياسة الإلغاء",

    // Sticky
    sticky_book: "احجز الآن",
  },
} as const;

export type TKey = keyof typeof T.EN;

export function t(lang: Lang, key: TKey): string {
  return (T[lang] as Record<string, string>)[key] ?? (T.EN as Record<string, string>)[key];
}

// Inline bilingual helper for page-level content that isn't worth a full token.
export function useL() {
  const lang = useLang();
  return (en: string, ar: string) => (lang === "AR" ? ar : en);
}

// ─── Localised data arrays ─────────────────────────────────────────────────────

export interface FaqItem { q: string; a: string }

export const FAQS: Record<Lang, FaqItem[]> = {
  EN: [
    { q: "How will I meet my driver at Hurghada Airport?", a: "Your driver will be waiting in the arrivals hall holding a sign with your name. If you can't find them, a quick WhatsApp message connects you instantly." },
    { q: "Is the displayed transfer price final?", a: "Yes. The approved base price and every applicable airport, permit, discount, or accommodation item are shown separately before submission." },
    { q: "Can I book a Round Trip?", a: "Yes. LuxRide shows the approved fixed Round Trip price and the route classification clearly before submission." },
    { q: "What happens if my flight is delayed?", a: "We monitor your flight in real time and adjust the pickup automatically — at no extra cost to you." },
    { q: "Can I request a child seat?", a: "This service is currently unavailable and will be provided soon." },
    { q: "How can I confirm my booking?", a: "Complete the three booking steps and use the single Send Booking Request button. LuxRide will review the details and contact you to confirm availability." },
    { q: "What is the cancellation policy?", a: "Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time." },
  ],
  AR: [
    { q: "كيف سألتقي بسائقي في مطار الغردقة؟", a: "سيكون سائقك في انتظارك في صالة الوصول حاملاً لافتة باسمك. إذا لم تجده، رسالة واتساب سريعة تصلك به فوراً." },
    { q: "هل السعر المعروض للنقل نهائي؟", a: "نعم. يُعرض السعر الأساسي المعتمد وكل رسم مطار أو تصريح أو خصم أو مبيت مطبق بشكل منفصل قبل الإرسال." },
    { q: "هل يمكنني حجز ذهاب وعودة؟", a: "نعم. تعرض LuxRide سعر الذهاب والعودة الثابت المعتمد وتصنيف المسار بوضوح قبل الإرسال." },
    { q: "ماذا يحدث إذا تأخرت رحلتي الجوية؟", a: "نتابع رحلتك في الوقت الفعلي ونعدّل موعد الاستلام تلقائياً — دون أي تكلفة إضافية." },
    { q: "هل يمكنني طلب كرسي أطفال؟", a: "هذه الخدمة غير متاحة حالياً وسيتم توفيرها قريباً." },
    { q: "كيف يمكنني تأكيد حجزي؟", a: "أكمل خطوات الحجز الثلاث واستخدم زر إرسال طلب الحجز الوحيد. ستراجع LuxRide التفاصيل وتتواصل معك لتأكيد التوفر." },
    { q: "ما سياسة الإلغاء؟", a: "استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة من وقت البدء." },
  ],
};

export const NAV_KEYS: Array<{ key: TKey; href: string }> = [
  { key: "nav_home", href: "#home" },
  { key: "nav_transfers", href: "#transfers" },
  { key: "nav_destinations", href: "#destinations" },
  { key: "nav_fleet", href: "#fleet" },
  { key: "nav_about", href: "#about" },
  { key: "nav_reviews", href: "#reviews" },
  { key: "nav_contact", href: "#contact" },
];

export const QUICK_LINKS: Array<{ key: TKey; href: string }> = [
  { key: "nav_home", href: "#home" },
  { key: "nav_transfers", href: "#transfers" },
  { key: "nav_fleet", href: "#fleet" },
  { key: "nav_about", href: "#about" },
  { key: "nav_reviews", href: "#reviews" },
  { key: "nav_contact", href: "#contact" },
];

export const DEST_KEYS: TKey[] = ["dest_1","dest_2","dest_3","dest_4","dest_5","dest_6","dest_7"];

export const POPULAR_DEST_LABELS: Record<Lang, string[]> = {
  EN: ["Hurghada","El Gouna","Makadi Bay","Soma Bay","Sahl Hasheesh","Luxor","Marsa Alam"],
  AR: ["الغردقة","الجونة","مكادي باي","سوما باي","سهل حشيش","الأقصر","مرسى علم"],
};
