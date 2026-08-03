import { PageShell } from "../components/luxride/PageShell";
import { FLEET } from "../components/luxride/data";
import { LuxRideLogo } from "../components/luxride/LuxRideLogo";
import { NOTIFICATION_FIELDS, NOTIFICATION_NOTES, NOTIFICATION_PRICING } from "../components/luxride/notificationPreview";
import { useLang, useL } from "../components/luxride/i18n";

export function EmailPreviewPage() {
  const lang = useLang();
  const L = useL();
  const xpander = FLEET[0];

  return (
    <PageShell crumb={L("Email Notification", "إشعار البريد الإلكتروني")} title={L("Email Notification Preview", "معاينة إشعار البريد الإلكتروني")} subtitle={L("A complete booking-request email for the LuxRide team.", "بريد طلب حجز مكتمل لفريق LuxRide.")}>
      <section className="bg-lux-beige py-16 md:py-24"><div className="mx-auto max-w-2xl px-4 md:px-8">
        <div className="overflow-hidden rounded-3xl border border-lux-charcoal/10 bg-white shadow-xl" dir={lang === "AR" ? "rtl" : "ltr"}>
          <div className="space-y-1 border-b border-lux-charcoal/10 bg-lux-beige/50 px-6 py-4 text-sm"><p><span className="text-neutral-400">{L("Subject", "الموضوع")}:</span> <span className="text-lux-charcoal">{L("New Booking via LuxRide", "حجز جديد عبر LuxRide")}</span></p></div>
          <div className="bg-lux-dark px-6 py-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1"><LuxRideLogo className="h-14 w-14" /></div><h2 className="mt-3 text-lux-beige" style={{ fontSize: "1.6rem", fontWeight: 700 }}>{L("New Booking via LuxRide", "حجز جديد عبر LuxRide")}</h2></div>
          <div className="px-6 py-6">
            <p className="text-sm text-neutral-600">{L("A new booking request has been submitted with the following details:", "تم إرسال طلب حجز جديد بالتفاصيل التالية:")}</p>
            <img src={xpander.image} alt={xpander.name} className="mt-4 h-32 w-full rounded-xl bg-neutral-50 object-contain p-2" />
            <div className="mt-5 overflow-hidden rounded-xl border border-lux-charcoal/10">{NOTIFICATION_FIELDS.map((row, index) => <div key={row.en} className={`grid grid-cols-2 gap-3 px-4 py-2.5 text-sm ${index > 0 ? "border-t border-lux-charcoal/10" : ""}`}><span className="text-neutral-500">{lang === "AR" ? row.ar : row.en}</span><span className="break-words text-lux-charcoal">{row.value}</span></div>)}</div>
            <h3 className="mt-6 text-lux-charcoal" style={{ fontSize: "1rem" }}>{L("Price Breakdown", "تفاصيل السعر")}</h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-lux-charcoal/10">{NOTIFICATION_PRICING.map((row) => <div key={row.en} className={`flex items-center justify-between px-4 py-2.5 text-sm ${row.en === "Final Total" ? "bg-lux-green/5" : "border-b border-lux-charcoal/10"}`}><span className="text-neutral-500">{lang === "AR" ? row.ar : row.en}</span><span className={row.en === "Final Total" ? "font-semibold text-lux-green" : "text-lux-charcoal"}>{row.value}</span></div>)}</div>
            <div className="mt-5 rounded-xl bg-lux-beige p-4 text-sm text-neutral-600"><span className="text-neutral-400">{L("Notes", "ملاحظات")}: </span>{NOTIFICATION_NOTES}</div>
          </div>
          <div className="border-t border-lux-charcoal/10 px-6 py-4 text-center text-xs text-neutral-400">LuxRide · Premium Transfers in Egypt</div>
        </div>
      </div></section>
    </PageShell>
  );
}
