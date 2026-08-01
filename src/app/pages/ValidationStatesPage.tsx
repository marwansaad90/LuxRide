import { AlertTriangle, Ban, Check, Info, PlaneLanding, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import { PageShell } from "../components/luxride/PageShell";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useL } from "../components/luxride/i18n";

export function ValidationStatesPage() {
  const L = useL();

  return (
    <PageShell
      crumb={L("Validation & Error States", "حالات التحقق والأخطاء")}
      title={L("Booking Validation & Error States", "حالات التحقق والأخطاء في الحجز")}
      subtitle={L(
        "A reference gallery of the form and booking states used across the calculator, prepared for WordPress implementation.",
        "معرض مرجعي لحالات النموذج والحجز المستخدمة عبر الحاسبة، معدّ لتنفيذ ووردبريس.",
      )}
    >
      <section className="bg-lux-beige py-16 md:py-24">
        <div className="mx-auto max-w-4xl space-y-10 px-4 md:px-8">
          {/* Form field states */}
          <div>
            <h2 className="mb-4 text-lux-charcoal" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{L("Form field states", "حالات حقول النموذج")}</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-lux-charcoal/8 bg-white p-5">
                <Label className="text-xs text-neutral-500">{L("Required field", "حقل مطلوب")} *</Label>
                <Input placeholder={L("Full name", "الاسم الكامل")} className="mt-1.5 h-11" />
                <p className="mt-2 text-xs text-neutral-400">{L("This field is required.", "هذا الحقل مطلوب.")}</p>
              </div>
              <div className="rounded-2xl border border-lux-green/40 bg-white p-5">
                <Label className="text-xs text-neutral-500">{L("Valid field", "حقل صحيح")}</Label>
                <div className="mt-1.5 flex h-11 items-center justify-between rounded-md border border-lux-green px-3 text-sm text-lux-charcoal">John Smith <Check className="h-4 w-4 text-lux-green" /></div>
                <p className="mt-2 flex items-center gap-1 text-xs text-lux-green"><Check className="h-3 w-3" /> {L("Looks good.", "يبدو جيداً.")}</p>
              </div>
              <div className="rounded-2xl border border-red-400/50 bg-white p-5">
                <Label className="text-xs text-neutral-500">{L("Error field", "حقل به خطأ")}</Label>
                <div className="mt-1.5 flex h-11 items-center rounded-md border border-red-400 px-3 text-sm text-red-500">—</div>
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500"><AlertTriangle className="h-3 w-3" /> {L("Please complete this field.", "يرجى إكمال هذا الحقل.")}</p>
              </div>
            </div>
          </div>

          {/* Conditional requirement notices */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Notice icon={PlaneLanding} tone="green" title={L("Flight number required", "رقم الرحلة مطلوب")}
              text={L("Revealed and required for airport arrivals. We monitor your flight in real time and adjust the pickup time.", "يظهر ويكون مطلوباً لوصول المطار. نتابع رحلتك في الوقت الفعلي ونعدّل موعد الاستلام.")} />
            <Notice icon={ShieldCheck} tone="orange" title={L("Passport / ID required", "جواز السفر / الهوية مطلوب")}
              text={L("Required for Luxor, Aswan, Cairo and Sharm El Sheikh, where an official travel permit applies.", "مطلوب للأقصر وأسوان والقاهرة وشرم الشيخ، حيث يُطبّق تصريح سفر رسمي.")} />
          </div>

          {/* 3-hour cut-off */}
          <div className="rounded-2xl border border-lux-orange/40 bg-lux-orange/10 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-lux-orange" />
              <div>
                <h3 className="text-lux-charcoal" style={{ fontSize: "1.1rem" }}>{L("3-hour booking cut-off", "مهلة الحجز ٣ ساعات")}</h3>
                <p className="mt-1 text-sm text-neutral-600">{L("This transfer must be booked at least 3 hours before departure. Standard online booking is unavailable for this departure time.", "يجب حجز هذه الرحلة قبل ٣ ساعات على الأقل من المغادرة. الحجز القياسي عبر الإنترنت غير متاح لهذا الموعد.")}</p>
                <Link to="/last-minute" className="mt-3 inline-block rounded-full bg-lux-orange px-5 py-2 text-sm text-lux-dark transition-all hover:brightness-105">{L("Try Last-minute Booking", "جرّب الحجز اللحظي")}</Link>
              </div>
            </div>
          </div>

          {/* Availability states */}
          <div>
            <h2 className="mb-4 text-lux-charcoal" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{L("Availability states", "حالات التوفر")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StateChip tone="green" label={L("Available", "متاح")} />
              <StateChip tone="orange" label={L("Limited availability", "توفر محدود")} />
              <StateChip tone="red" label={L("Fully booked", "محجوز بالكامل")} icon={Ban} />
              <StateChip tone="gray" label={L("Date blocked", "تاريخ محظور")} />
              <StateChip tone="gray" label={L("Time blocked", "وقت محظور")} />
              <StateChip tone="gray" label={L("Vehicle blocked", "سيارة محظورة")} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Notice({ icon: Icon, tone, title, text }: { icon: React.ElementType; tone: "green" | "orange"; title: string; text: string }) {
  const c = tone === "green" ? "border-lux-green/30 text-lux-green" : "border-lux-orange/40 text-lux-orange";
  return (
    <div className={`rounded-2xl border bg-white p-6 ${c.split(" ")[0]}`}>
      <Icon className={`h-6 w-6 ${c.split(" ")[1]}`} />
      <h3 className="mt-3 text-lux-charcoal" style={{ fontSize: "1.1rem" }}>{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{text}</p>
    </div>
  );
}

function StateChip({ tone, label, icon: Icon = Info }: { tone: "green" | "orange" | "red" | "gray"; label: string; icon?: React.ElementType }) {
  const map: Record<string, string> = {
    green: "border-lux-green/40 bg-lux-green/10 text-lux-green",
    orange: "border-lux-orange/40 bg-lux-orange/10 text-lux-bronze",
    red: "border-red-400/40 bg-red-50 text-red-500",
    gray: "border-lux-charcoal/15 bg-white text-neutral-500",
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${map[tone]}`}>
      <Icon className="h-4 w-4" /> {label}
    </div>
  );
}
