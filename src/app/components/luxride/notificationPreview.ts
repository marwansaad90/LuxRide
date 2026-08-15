export interface NotificationPreviewRow {
  en: string;
  ar: string;
  value: string;
}

export const NOTIFICATION_FIELDS: NotificationPreviewRow[] = [
  { en: "Customer Name", ar: "اسم العميل", value: "Sample Guest" },
  { en: "Email", ar: "البريد الإلكتروني", value: "guest@example.com" },
  { en: "WhatsApp", ar: "واتساب", value: "+20 100 000 0000" },
  { en: "Transfer Type", ar: "نوع التوصيلة", value: "Round Trip" },
  { en: "Return", ar: "العودة", value: "Round Trip" },
  { en: "Pickup", ar: "الاستلام", value: "Hurghada" },
  { en: "Destination", ar: "الوجهة", value: "Luxor" },
  { en: "Hotel / Exact Destination", ar: "الفندق / الوجهة الدقيقة", value: "Hotel reception" },
  { en: "Departure Date / Time", ar: "تاريخ / وقت المغادرة", value: "10 Aug 2026 · 08:00" },
  { en: "Return Date / Time", ar: "تاريخ / وقت العودة", value: "10 Aug 2026 · 20:00" },
  { en: "Vehicle", ar: "السيارة", value: "Mitsubishi Xpander 2027 (MPV)" },
  { en: "Passengers", ar: "الركاب", value: "4" },
  { en: "Luggage", ar: "الأمتعة", value: "3" },
  { en: "Flight Number", ar: "رقم الرحلة", value: "Not applicable" },
  { en: "Room Number", ar: "رقم الغرفة", value: "214" },
  { en: "Passport / ID", ar: "جواز / هوية", value: "Provided" },
];

export const NOTIFICATION_PRICING: NotificationPreviewRow[] = [
  { en: "Base Price", ar: "السعر الأساسي", value: "€90" },
  { en: "Discount", ar: "الخصم", value: "€0" },
  { en: "Airport Fee", ar: "رسوم المطار", value: "€0" },
  { en: "Permit Fee", ar: "رسوم التصريح", value: "€20" },
  { en: "Accommodation", ar: "المبيت", value: "€0" },
  { en: "Final Total", ar: "الإجمالي النهائي", value: "€110" },
];

export const NOTIFICATION_NOTES = "Please meet the guest at hotel reception.";
