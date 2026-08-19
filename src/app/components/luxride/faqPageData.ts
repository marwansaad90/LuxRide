import type { Lang } from "./i18n";

export interface FaqPageItem {
  q: string;
  a: string;
}

export const FAQ_PAGE_ITEMS: Record<Lang, FaqPageItem[]> = {
  EN: [
    { q: "Is the displayed transfer price final?", a: "Yes. The price displayed in the calculator is fixed and inclusive, with no hidden fees. Airport operating fees and mandatory tourism travel permits are displayed separately and clearly before the booking is submitted." },
    { q: "Can I request a child seat?", a: "Yes, a child seat can be requested free of charge with any transfer. Please select the child seat option when booking." },
    { q: "How can I confirm my booking?", a: "Complete the three booking steps and select the single Send Booking Request button. LuxRide will review the details and contact you to confirm availability." },
    { q: "Can I make a booking for today?", a: "Standard online bookings must be submitted at least three hours before departure. For last-minute or same-day bookings, contact LuxRide directly through WhatsApp to check availability." },
    { q: "What happens if my flight is delayed?", a: "LuxRide monitors your flight status in real time and adjusts the airport pickup time accordingly. Free waiting is provided for up to 3 hours from the actual arrival time." },
    { q: "How long will the driver wait at the airport?", a: "The maximum waiting time for airport arrivals is three hours." },
    { q: "Do long-distance transfers require travel permits?", a: "Yes. Transfers to Luxor, Aswan, Cairo, and Sharm El Sheikh require an official tourism and security permit. The applicable permit fee is displayed clearly in the final booking price." },
    { q: "Can I book a Round Trip?", a: "Yes. Every route supports One Way and Round Trip options, with the approved fixed price shown before submission." },
    { q: "Are taxes included?", a: "Yes. All prices are shown in EUR and are tax inclusive." },
    { q: "Can I change my booking?", a: "Yes. Contact us on WhatsApp with your booking details and we will do our best to accommodate changes based on availability." },
    { q: "What is the cancellation policy?", a: "Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time." },
    { q: "How do I meet the driver?", a: "For airport arrivals, your driver waits in the arrivals hall holding a sign with your name. For hotel pickups, the driver meets you at reception at the agreed time." },
    { q: "Can additional destinations be added?", a: "Yes. Mention any additional stops in your booking notes or on WhatsApp and we will provide an updated fixed price." },
  ],
  AR: [
    { q: "هل السعر المعروض للنقل نهائي؟", a: "نعم. السعر المعروض في الحاسبة ثابت وشامل، بدون رسوم خفية. تُعرض رسوم تشغيل المطار وتصاريح السفر السياحي الإلزامية بشكل منفصل وواضح قبل إرسال الحجز." },
    { q: "هل يمكنني طلب كرسي أطفال؟", a: "نعم، يمكن طلب كرسي أطفال مجاناً مع أي توصيلة. يرجى اختيار خيار كرسي الأطفال أثناء الحجز." },
    { q: "كيف يمكنني تأكيد حجزي؟", a: "أكمل خطوات الحجز الثلاث ثم اختر زر إرسال طلب الحجز الوحيد. ستراجع LuxRide التفاصيل وتتواصل معك لتأكيد التوفر." },
    { q: "هل يمكنني الحجز لليوم؟", a: "يجب تقديم الحجوزات القياسية عبر الإنترنت قبل ثلاث ساعات على الأقل من المغادرة. للحجوزات اللحظية أو في نفس اليوم، تواصل مع LuxRide مباشرةً عبر واتساب للتحقق من التوفر." },
    { q: "ماذا يحدث إذا تأخرت رحلتي الجوية؟", a: "تتابع LuxRide حالة الرحلة لحظياً ويتم تعديل وقت الاستقبال وفقاً لموعد الوصول الفعلي، مع انتظار مجاني بحد أقصى 3 ساعات." },
    { q: "كم سينتظر السائق في المطار؟", a: "الحد الأقصى لوقت الانتظار لوصول المطار هو ثلاث ساعات." },
    { q: "هل تتطلب التوصيلات بعيدة المسافة تصاريح سفر؟", a: "نعم. تتطلب التوصيلات إلى الأقصر وأسوان والقاهرة وشرم الشيخ تصريحاً سياحياً وأمنياً رسمياً. تُعرض رسوم التصريح المطبقة بوضوح في السعر النهائي للحجز." },
    { q: "هل يمكنني حجز ذهاب وعودة؟", a: "نعم. يدعم كل مسار خياري الذهاب فقط والذهاب والعودة، مع عرض السعر الثابت المعتمد قبل الإرسال." },
    { q: "هل الضرائب مشمولة؟", a: "نعم. جميع الأسعار معروضة باليورو وشاملة الضريبة." },
    { q: "هل يمكنني تعديل حجزي؟", a: "نعم. تواصل معنا عبر واتساب مع تفاصيل حجزك وسنبذل قصارى جهدنا لاستيعاب التغييرات حسب التوفر." },
    { q: "ما هي سياسة الإلغاء؟", a: "استرداد كامل عند الإلغاء قبل ٢٤ ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من ٢٤ ساعة من وقت البدء." },
    { q: "كيف أقابل السائق؟", a: "لوصول المطار، ينتظرك السائق في صالة الوصول حاملاً لافتة باسمك. لاستلام الفنادق، يقابلك السائق في الاستقبال في الوقت المتفق عليه." },
    { q: "هل يمكن إضافة وجهات إضافية؟", a: "نعم. اذكر أي محطات إضافية في ملاحظات حجزك أو عبر واتساب وسنوفّر سعراً ثابتاً محدّثاً." },
  ],
};
