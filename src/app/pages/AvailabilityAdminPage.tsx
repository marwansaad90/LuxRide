import {
  Ban,
  CalendarDays,
  Car,
  Check,
  Clock,
  RefreshCw,
  Settings,
  ToggleRight,
} from "lucide-react";
import { PageShell } from "../components/luxride/PageShell";
import { useL } from "../components/luxride/i18n";

const BLOCKING = [
  { route: "Hurghada hotels", ar: "فنادق الغردقة", h: 1 },
  { route: "Makadi Bay", ar: "مكادي باي", h: 2 },
  { route: "Sahl Hasheesh", ar: "سهل حشيش", h: 2 },
  { route: "El Gouna", ar: "الجونة", h: 2 },
  { route: "Safaga", ar: "سفاجا", h: 4 },
  { route: "Marsa Alam", ar: "مرسى علم", h: 6 },
  { route: "Zaafarana", ar: "الزعفرانة", h: 6 },
  { route: "Luxor", ar: "الأقصر", h: 12 },
  { route: "Alexandria", ar: "الإسكندرية", h: 24 },
  { route: "Sharm El Sheikh", ar: "شرم الشيخ", h: 24 },
  { route: "Cairo", ar: "القاهرة", h: 24 },
  { route: "Aswan", ar: "أسوان", h: 24 },
];

const BOOKINGS = [
  { id: "LR-00417", route: "Hurghada → Luxor", time: "07:00", status: "confirmed", vehicle: "Xpander" },
  { id: "LR-00418", route: "Airport → El Gouna", time: "11:30", status: "pending", vehicle: "—" },
  { id: "LR-00419", route: "Makadi → Airport", time: "14:15", status: "confirmed", vehicle: "Xpander" },
  { id: "LR-00420", route: "Hurghada → Cairo", time: "18:00", status: "cancelled", vehicle: "—" },
];

export function AvailabilityAdminPage() {
  const L = useL();

  const statusStyle: Record<string, string> = {
    confirmed: "bg-lux-green/10 text-lux-green",
    pending: "bg-lux-orange/10 text-lux-bronze",
    cancelled: "bg-red-50 text-red-500",
  };
  const statusLabel: Record<string, string> = {
    confirmed: L("Confirmed", "مؤكد"),
    pending: L("Pending", "قيد الانتظار"),
    cancelled: L("Cancelled", "ملغى"),
  };

  return (
    <PageShell
      crumb={L("Availability Admin", "إدارة التوفر")}
      title={L("Availability Admin", "لوحة إدارة التوفر")}
      subtitle={L(
        "Operational controls for managing vehicle and date availability.",
        "عناصر تشغيلية لإدارة توفر السيارات والتواريخ.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-8">
          {/* Controls row */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Panel icon={CalendarDays} title={L("Daily booking limit", "حد الحجوزات اليومي")}>
              <div className="flex items-end gap-2">
                <span className="text-lux-green" style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1 }}>20</span>
                <span className="pb-1 text-sm text-neutral-500">{L("confirmed / day (default)", "مؤكد / يوم (افتراضي)")}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{L("Editable per business needs.", "قابل للتعديل حسب احتياج العمل.")}</p>
            </Panel>
            <Panel icon={ToggleRight} title={L("Automatic blocking", "الحظر التلقائي")}>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-lux-green/10 px-3 py-1 text-lux-green"><Check className="h-3.5 w-3.5" /> {L("Enabled", "مُفعّل")}</span>
                <span className="rounded-full border border-lux-charcoal/15 px-3 py-1 text-neutral-500">{L("Disable", "تعطيل")}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{L("Blocks a vehicle for the route duration after a confirmed trip.", "يحظر السيارة لمدة المسار بعد رحلة مؤكدة.")}</p>
            </Panel>
            <Panel icon={RefreshCw} title={L("Manual override", "التجاوز اليدوي")}>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-lux-orange/10 px-3 py-1 text-lux-bronze">{L("Replacement vehicle available", "سيارة بديلة متاحة")}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{L("Override blocking when a partner vehicle can cover the trip.", "تجاوز الحظر عند توفر سيارة شريك لتغطية الرحلة.")}</p>
            </Panel>
          </div>

          {/* Calendar + bookings */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Panel icon={CalendarDays} title={L("Booking calendar", "تقويم الحجوزات")} className="lg:col-span-1">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {[...Array(35)].map((_, i) => {
                  const day = i - 2;
                  const valid = day > 0 && day <= 31;
                  const blocked = [8, 15].includes(day);
                  const full = [12].includes(day);
                  return (
                    <div key={i} className={`flex h-8 items-center justify-center rounded ${!valid ? "text-transparent" : blocked ? "bg-neutral-200 text-neutral-400 line-through" : full ? "bg-red-100 text-red-500" : "bg-lux-green/10 text-lux-green"}`}>
                      {valid ? day : "."}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-lux-green/10" /> {L("Available", "متاح")}</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100" /> {L("Fully booked", "محجوز")}</span>
                <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-neutral-200" /> {L("Blocked", "محظور")}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <button className="flex items-center justify-center gap-2 rounded-full border border-lux-charcoal/15 py-2 text-neutral-600"><Ban className="h-4 w-4" /> {L("Block date", "حظر تاريخ")}</button>
                <button className="flex items-center justify-center gap-2 rounded-full border border-lux-charcoal/15 py-2 text-neutral-600"><Clock className="h-4 w-4" /> {L("Block hours", "حظر ساعات")}</button>
                <button className="flex items-center justify-center gap-2 rounded-full border border-red-300 py-2 text-red-500"><Ban className="h-4 w-4" /> {L("Pause all bookings", "إيقاف جميع الحجوزات")}</button>
              </div>
            </Panel>

            <Panel icon={Car} title={L("Today's bookings", "حجوزات اليوم")} className="lg:col-span-2">
              <div className="overflow-hidden rounded-xl border border-lux-charcoal/10">
                <div className="grid grid-cols-5 gap-2 bg-lux-beige/60 px-4 py-2 text-xs text-neutral-500">
                  <span>{L("Ref", "المرجع")}</span>
                  <span className="col-span-2">{L("Route", "المسار")}</span>
                  <span>{L("Time", "الوقت")}</span>
                  <span>{L("Status", "الحالة")}</span>
                </div>
                {BOOKINGS.map((b, i) => (
                  <div key={b.id} className={`grid grid-cols-5 items-center gap-2 px-4 py-3 text-sm ${i > 0 ? "border-t border-lux-charcoal/10" : ""}`}>
                    <span className="text-neutral-500">{b.id}</span>
                    <span className="col-span-2 text-lux-charcoal">{b.route}</span>
                    <span className="text-neutral-600">{b.time}</span>
                    <span><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusStyle[b.status]}`}>{statusLabel[b.status]}</span></span>
                  </div>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400"><Settings className="h-3.5 w-3.5" /> {L("Assign vehicle, add notes and set route duration per booking.", "عيّن السيارة، وأضف ملاحظات، وحدّد مدة المسار لكل حجز.")}</p>
            </Panel>
          </div>

          {/* Route blocking durations */}
          <Panel icon={Clock} title={L("Route-based blocking durations", "مدد الحظر حسب المسار")}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {BLOCKING.map((r) => (
                <div key={r.route} className="flex items-center justify-between rounded-lg border border-lux-charcoal/10 px-3 py-2 text-sm">
                  <span className="text-lux-charcoal">{L(r.route, r.ar)}</span>
                  <span className="text-lux-green">{r.h} {L("h", "س")}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-400">{L("Blocking begins from the confirmed trip time.", "يبدأ الحظر من وقت الرحلة المؤكد.")}</p>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}

function Panel({ icon: Icon, title, children, className = "" }: { icon: React.ElementType; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-lux-charcoal/8 bg-white p-6 ${className}`}>
      <h3 className="flex items-center gap-2 text-lux-charcoal" style={{ fontSize: "1.05rem" }}>
        <Icon className="h-5 w-5 text-lux-green" /> {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
