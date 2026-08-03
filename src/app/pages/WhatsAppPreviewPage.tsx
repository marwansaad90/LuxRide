import { Check, CheckCheck } from "lucide-react";
import { PageShell } from "../components/luxride/PageShell";
import { FLEET } from "../components/luxride/data";
import { LuxRideLogo } from "../components/luxride/LuxRideLogo";
import { NOTIFICATION_FIELDS, NOTIFICATION_NOTES, NOTIFICATION_PRICING } from "../components/luxride/notificationPreview";
import { useLang, useL } from "../components/luxride/i18n";

export function WhatsAppPreviewPage() {
  const lang = useLang();
  const L = useL();
  const xpander = FLEET[0];

  return (
    <PageShell crumb={L("WhatsApp Notification", "إشعار واتساب")} title={L("WhatsApp Notification Preview", "معاينة إشعار واتساب")} subtitle={L("A complete booking-request message for the LuxRide team.", "رسالة طلب حجز مكتملة لفريق LuxRide.")}>
      <section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-md px-4 md:px-8">
        <div className="overflow-hidden rounded-3xl border border-lux-charcoal/10 bg-[#e5ddd5] shadow-xl">
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-0.5"><LuxRideLogo className="h-9 w-9" /></div><div><p className="text-sm">LuxRide Bookings</p><p className="text-xs text-white/70">{L("online", "متصل")}</p></div></div>
          <div className="space-y-3 p-4" dir={lang === "AR" ? "rtl" : "ltr"}><div className="ml-auto max-w-[92%] rounded-xl rounded-tr-none bg-[#dcf8c6] p-3 text-sm text-neutral-800" style={{ lineHeight: 1.55 }}>
            <p className="mb-2 text-[#075e54]" style={{ fontWeight: 600 }}>🚘 {L("New Booking via LuxRide", "حجز جديد عبر LuxRide")}</p>
            <img src={xpander.image} alt={xpander.name} className="mb-2 h-24 w-full rounded-lg bg-white object-contain p-1" />
            {NOTIFICATION_FIELDS.map((row) => <p key={row.en}><span className="text-neutral-500">{lang === "AR" ? row.ar : row.en}:</span> {row.value}</p>)}
            <div className="my-2 border-t border-black/10" />
            {NOTIFICATION_PRICING.map((row) => <p key={row.en} className={row.en === "Final Total" ? "text-[#075e54]" : ""} style={row.en === "Final Total" ? { fontWeight: 600 } : undefined}><span className={row.en === "Final Total" ? "" : "text-neutral-500"}>{lang === "AR" ? row.ar : row.en}:</span> {row.value}</p>)}
            <div className="my-2 border-t border-black/10" /><p><span className="text-neutral-500">{L("Notes", "ملاحظات")}:</span> {NOTIFICATION_NOTES}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-xs text-neutral-500">07:14 <CheckCheck className="h-3.5 w-3.5 text-[#34b7f1]" /></p>
          </div></div>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400"><Check className="h-3.5 w-3.5 text-lux-green" /> {L("Fields mirror the booking calculator output.", "الحقول تطابق مخرجات حاسبة الحجز.")}</p>
      </div></section>
    </PageShell>
  );
}
