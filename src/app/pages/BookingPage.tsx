import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Luggage,
  MapPin,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import {
  BOOKING_CUTOFF_HOURS,
  FLEET,
  TripType,
  VehicleId,
  computePrice,
  availableTripTypes,
  destinationsFor,
  findRoute,
  pickupLocations,
  whatsappLink,
} from "../components/luxride/data";
import { formatEur, isValidReturn, readInitialBookingState } from "../components/luxride/bookingState";
import { locationLabel, useLang } from "../components/luxride/i18n";

const PICKUPS = pickupLocations();
type Step = 1 | 2 | 3;

export function BookingPage() {
  const lang = useLang();
  const isAR = lang === "AR";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = useMemo(() => readInitialBookingState(searchParams), [searchParams]);

  // ── Step 1 state (pre-filled from URL params) ──────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [trip, setTrip] = useState<TripType>(initial.trip);
  const [from, setFrom] = useState(initial.from);
  const [dests, setDests] = useState(() => destinationsFor(initial.from));
  const [to, setTo] = useState(initial.to);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [vehicleId, setVehicleId] = useState<VehicleId>(initial.vehicleId);
  const [pax, setPax] = useState(initial.pax);
  const [luggage, setLuggage] = useState(initial.luggage);
  const [capacityNotice, setCapacityNotice] = useState(initial.corrected);

  // ── Step 2 state ────────────────────────────────────────────────────────────
  const [hotel, setHotel] = useState("");
  const [room, setRoom] = useState("");
  const [flight, setFlight] = useState("");
  const [passport, setPassport] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  // ── Derived ─────────────────────────────────────────────────────────────────
  const vehicle = FLEET.find((v) => v.id === vehicleId) ?? FLEET[0];
  const route = findRoute(from, to);
  const breakdown = useMemo(
    () => (route ? computePrice(route, trip, vehicle) : null),
    [route, trip, vehicle],
  );
  const isAirportArrival = from === "Hurghada Airport";
  const needsPermit = !!route?.permit;
  const needsReturn = trip === "overday" || trip === "overnight";
  const supportedTrips = useMemo(() => availableTripTypes(route), [route]);
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().split("T")[0];
  }, []);

  const tooSoon = useMemo(() => {
    if (!date || !time) return false;
    const departure = new Date(`${date}T${time}`);
    if (isNaN(departure.getTime())) return false;
    return departure.getTime() - Date.now() < BOOKING_CUTOFF_HOURS * 3600_000;
  }, [date, time]);

  function handlePickup(value: string) {
    setFrom(value);
    const d = destinationsFor(value);
    setDests(d);
    if (!d.includes(to)) setTo(d[0]);
  }

  function handleDestination(value: string) {
    setTo(value);
  }

  function handleVehicleChange(id: VehicleId) {
    const v = FLEET.find((f) => f.id === id);
    if (!v || !v.available) return;
    setVehicleId(id);
    const exceedsCapacity = parseInt(pax) > v.pax || parseInt(luggage) > v.luggage;
    if (parseInt(pax) > v.pax) setPax(String(v.pax));
    if (parseInt(luggage) > v.luggage) setLuggage(String(v.luggage));
    setCapacityNotice(exceedsCapacity);
  }

  useEffect(() => {
    if (route && !supportedTrips.includes(trip)) {
      setTrip(supportedTrips[0] ?? "oneWay");
    }
  }, [route, supportedTrips, trip]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const tripLabel =
    trip === "oneWay" ? (isAR ? "ذهاب فقط" : "One Way")
    : trip === "overday" ? (isAR ? "يوم كامل" : "Overday")
    : (isAR ? "مبيت" : "Overnight");

  const hasValidReturn = isValidReturn(trip, date, time, returnDate, returnTime);
  const step1Valid = !!(from && to && date && time && breakdown && vehicle.available);
  const step2Valid =
    hotel.trim().length > 0 &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    (!isAirportArrival || flight.trim().length > 0) &&
    (!needsPermit || passport.trim().length > 0) &&
    hasValidReturn;

  function handleSubmit() {
    if (!step1Valid || !step2Valid || tooSoon || !breakdown) {
      setStep(step1Valid && !tooSoon ? 2 : 1);
      return;
    }
    navigate("/booking-success", {
      state: {
        tripLabel,
        route: `${locationLabel(lang, from)} → ${locationLabel(lang, to)}`,
        vehicleName: vehicle.name,
        vehicleCategory: isAR ? vehicle.categoryAr : vehicle.category,
        vehicleImage: vehicle.image,
        departure: `${date} · ${time}`,
        passengers: pax,
        luggage,
        total: formatEur(breakdown.total),
      },
    });
  }

  const hFamily = isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif";
  const inputCls =
    "w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-gray-800 text-sm focus:border-lux-green focus:outline-none focus:ring-2 focus:ring-lux-green/20 transition-all";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  const tripTypes: { id: TripType; label: string; desc: string }[] = [
    { id: "oneWay", label: isAR ? "ذهاب فقط" : "One Way", desc: isAR ? "رحلة واحدة" : "Single direction" },
    { id: "overday", label: isAR ? "يوم كامل" : "Overday", desc: isAR ? "ذهاب وعودة اليوم ذاته" : "Same-day return" },
    { id: "overnight", label: isAR ? "مبيت" : "Overnight", desc: isAR ? "عودة اليوم التالي" : "Next-day return" },
  ];

  const stepLabels: Record<Step, string> = {
    1: isAR ? "قدّر رحلتك" : "Estimate Your Trip",
    2: isAR ? "بياناتك" : "Your Details",
    3: isAR ? "المراجعة والإرسال" : "Review & Send",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Page header */}
      <div className="bg-lux-green py-10 pt-28 md:pt-32">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <h1
            className="text-white"
            style={{ fontFamily: hFamily, fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800 }}
          >
            {isAR ? "احجز رحلتك" : "Book Your Transfer"}
          </h1>
          <p className="mt-2 text-white/80">
            {isAR ? "أسعار ثابتة · بدون رسوم خفية" : "Fixed prices · No hidden fees"}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[calc(var(--header-h,72px))] z-20">
        <div className="mx-auto flex max-w-3xl px-4 md:px-8">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex flex-1 flex-col items-center py-4 relative">
                {i < 2 && (
                  <div
                    className={`absolute top-[1.75rem] hidden h-px sm:block ${done ? "bg-lux-green" : "bg-gray-200"}`}
                    style={{ left: "calc(50% + 1.5rem)", right: "-50%" }}
                  />
                )}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                    done ? "border-lux-green bg-lux-green text-white"
                    : active ? "border-lux-green bg-white text-lux-green"
                    : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : s}
                </div>
                <span
                  className={`mt-1.5 hidden text-xs sm:block ${
                    active ? "text-lux-green font-semibold" : done ? "text-lux-green" : "text-gray-400"
                  }`}
                >
                  {stepLabels[s]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">

        {/* ──────────────── STEP 1 ──────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:p-8">
              <h2 className="text-lux-charcoal mb-6" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
                {isAR ? "قدّر رحلتك" : "Estimate Your Trip"}
              </h2>

              {/* Trip type */}
              <div className="mb-6">
                <label className={labelCls}>{isAR ? "نوع الرحلة" : "Trip Type"}</label>
                <div className="grid grid-cols-3 gap-3">
                  {tripTypes.map((tt) => (
                    <button
                      type="button"
                      key={tt.id}
                      onClick={() => setTrip(tt.id)}
                      disabled={!supportedTrips.includes(tt.id)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        !supportedTrips.includes(tt.id) ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                        : trip === tt.id ? "border-lux-green bg-lux-green/5 text-lux-green" : "border-gray-200 text-gray-600 hover:border-lux-green/40"
                      }`}
                    >
                      <div className="font-semibold text-sm" style={{ fontFamily: hFamily }}>{tt.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{tt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Route */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-from" className={labelCls}><MapPin className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "موقع الانطلاق" : "Pickup"}</label>
                  <select id="booking-from" value={from} onChange={(e) => handlePickup(e.target.value)} className={inputCls}>
                    {PICKUPS.map((p) => <option key={p} value={p}>{locationLabel(lang, p)}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="booking-to" className={labelCls}><MapPin className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "الوجهة" : "Destination"}</label>
                  <select id="booking-to" value={to} onChange={(e) => handleDestination(e.target.value)} className={inputCls}>
                    {dests.map((d) => <option key={d} value={d}>{locationLabel(lang, d)}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="booking-date" className={labelCls}><CalendarDays className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "تاريخ المغادرة" : "Departure Date"}</label>
                  <input id="booking-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} min={todayLocal} />
                </div>
                <div>
                  <label htmlFor="booking-time" className={labelCls}><Clock className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "وقت الانطلاق" : "Pickup Time"}</label>
                  <input id="booking-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Vehicle selector */}
              <div className="mt-5">
                <label className={labelCls}>{isAR ? "السيارة" : "Vehicle"}</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {FLEET.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => handleVehicleChange(v.id)}
                      disabled={!v.available}
                      className={`relative rounded-xl border-2 p-4 text-start transition-all ${
                        !v.available ? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                        : vehicleId === v.id ? "border-lux-green bg-lux-green/5"
                        : "border-gray-200 hover:border-lux-green/40 bg-white"
                      }`}
                    >
                      {!v.available && (
                        <span className="absolute top-2 end-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                          {isAR ? "قريباً" : "Soon"}
                        </span>
                      )}
                      {vehicleId === v.id && v.available && (
                        <span className="absolute top-2 end-2 flex h-5 w-5 items-center justify-center rounded-full bg-lux-green">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      )}
                      <img src={v.image} alt="" className="mb-3 h-16 w-full object-contain" style={{ direction: "ltr" }} />
                      <div className={`text-sm font-semibold ${vehicleId === v.id ? "text-lux-green" : "text-gray-700"}`} style={{ fontFamily: hFamily }}>
                        {v.name}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">{isAR ? v.categoryAr : v.category}</div>
                      <div className="mt-2 flex gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {isAR ? v.capacityAr : v.capacityEn}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pax + Luggage */}
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="booking-passengers" className={labelCls}><Users className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "ركاب" : "Passengers"}</label>
                  <select id="booking-passengers" value={pax} onChange={(e) => setPax(e.target.value)} className={inputCls}>
                    {Array.from({ length: vehicle.pax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="booking-luggage" className={labelCls}><Luggage className="inline h-4 w-4 mr-1 text-lux-green" />{isAR ? "حقائب" : "Bags"}</label>
                  <select id="booking-luggage" value={luggage} onChange={(e) => setLuggage(e.target.value)} className={inputCls}>
                    {Array.from({ length: vehicle.luggage + 1 }, (_, i) => i).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {capacityNotice && (
                <div role="status" className="mt-4 rounded-xl border border-lux-orange/40 bg-orange-50 p-4 text-sm text-gray-700">
                  {isAR
                    ? `تم تصحيح الاختيار. المركبة المحددة تستوعب بحد أقصى ${vehicle.pax} ركاب و${vehicle.luggage} حقائب.`
                    : `Your selection was corrected. The selected vehicle supports up to ${vehicle.pax} passengers and ${vehicle.luggage} bags.`}
                </div>
              )}
            </div>

            {/* Price preview */}
            {breakdown && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="text-lux-charcoal mb-4" style={{ fontFamily: hFamily, fontSize: "1.1rem", fontWeight: 700 }}>
                  {isAR ? "معاينة السعر" : "Price Preview"}
                </h3>
                <PriceTable breakdown={breakdown} route={route} isAR={isAR} hFamily={hFamily} />
              </div>
            )}

            {/* 3h cutoff */}
            {tooSoon && (
              <div className="rounded-xl border border-lux-orange/30 bg-orange-50 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-lux-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-lux-charcoal">
                    {isAR ? "الحجز الفوري غير متاح" : "Standard booking unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isAR
                      ? "يتطلب الحجز العادي 3 ساعات على الأقل. تواصل عبر واتساب."
                      : "Standard booking requires at least 3 hours before departure. Contact us on WhatsApp to check last-minute availability."}
                  </p>
                  <a
                    href={whatsappLink("Hi LuxRide, I need a last-minute transfer.")}
                    target="_blank" rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-lux-orange px-5 py-2 text-sm text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {isAR ? "تحقق من التوفر" : "Check Availability"}
                  </a>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!step1Valid || tooSoon}
                className="flex items-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white font-medium shadow-md shadow-lux-green/25 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: hFamily, fontWeight: 700, fontSize: "1.05rem" }}
              >
                {isAR ? "التالي: بياناتك" : "Next: Your Details"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 2 ──────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:p-8">
              <h2 className="text-lux-charcoal mb-6" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
                {isAR ? "بيانات الفندق والراكب" : "Hotel & Passenger Details"}
              </h2>
              <div className="space-y-4">
                {needsReturn && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={isAR ? "تاريخ العودة *" : "Return Date *"} labelCls={labelCls}>
                      <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className={inputCls} min={date || todayLocal} />
                    </Field>
                    <Field label={isAR ? "وقت العودة *" : "Return Time *"} labelCls={labelCls}>
                      <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={inputCls} />
                    </Field>
                    {returnDate && returnTime && !hasValidReturn && (
                      <p role="alert" className="text-sm text-red-600 sm:col-span-2">
                        {isAR
                          ? trip === "overday" ? "يجب أن تكون العودة في اليوم نفسه وبعد المغادرة." : "يجب أن تكون عودة المبيت في يوم لاحق."
                          : trip === "overday" ? "Overday return must be later on the same day." : "Overnight return must be on a later date."}
                      </p>
                    )}
                  </div>
                )}
                <Field label={isAR ? "الفندق أو الوجهة الدقيقة *" : "Hotel or Exact Destination *"} labelCls={labelCls}>
                  <input type="text" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder={isAR ? "مثال: فندق ستيجنبرجر الداو" : "e.g. Steigenberger Al Dau, El Gouna"} className={inputCls} />
                </Field>
                <Field label={isAR ? "رقم الغرفة (اختياري)" : "Room Number (optional)"} labelCls={labelCls} note={isAR ? "إضافة رقم الغرفة يساعد على تنسيق الاستلام." : "Adding your room number helps us coordinate your pickup."}>
                  <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder={isAR ? "مثال: 214" : "e.g. 214"} className={inputCls} />
                </Field>
                {isAirportArrival && (
                  <Field label={isAR ? "رقم الرحلة الجوية *" : "Flight Number *"} labelCls={labelCls} note={isAR ? "نتابع رحلتك في الوقت الفعلي." : "We monitor your flight and adjust pickup time for delays."}>
                    <input type="text" value={flight} onChange={(e) => setFlight(e.target.value)} placeholder="e.g. MS763" className={inputCls} dir="ltr" />
                  </Field>
                )}
                {needsPermit && (
                  <Field label={isAR ? "رقم جواز السفر أو الهوية *" : "Passport / ID Number *"} labelCls={labelCls}>
                    <input type="text" value={passport} onChange={(e) => setPassport(e.target.value)} placeholder={isAR ? "مطلوب لتصريح السفر" : "Required for the travel permit"} className={inputCls} />
                  </Field>
                )}
                <Field label={isAR ? "الاسم الكامل *" : "Full Name *"} labelCls={labelCls}>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={isAR ? "الاسم الكامل" : "Your full name"} className={inputCls} />
                </Field>
                <Field label={isAR ? "رقم واتساب *" : "WhatsApp Number *"} labelCls={labelCls}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 101 355 4009" className={inputCls} dir="ltr" />
                </Field>
                <Field label={isAR ? "البريد الإلكتروني *" : "Email Address *"} labelCls={labelCls}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} dir="ltr" />
                </Field>
                <Field label={isAR ? "ملاحظات (اختياري)" : "Notes (optional)"} labelCls={labelCls}>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={isAR ? "أي معلومات إضافية..." : "Anything we should know?"} rows={3} className={`${inputCls} h-auto py-2.5 resize-none`} />
                </Field>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-gray-600 hover:border-lux-green hover:text-lux-green transition-all">
                <ArrowLeft className="h-5 w-5" /> {isAR ? "رجوع" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="flex items-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white font-medium shadow-md shadow-lux-green/25 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: hFamily, fontWeight: 700 }}
              >
                {isAR ? "التالي: مراجعة وإرسال" : "Next: Review & Send"} <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ──────────────── STEP 3 ──────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:p-8">
              <h2 className="text-lux-charcoal mb-6" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
                {isAR ? "مراجعة الحجز" : "Review Your Booking"}
              </h2>

              {/* Trip summary */}
              <ReviewSection title={isAR ? "تفاصيل الرحلة" : "Trip Details"} hFamily={hFamily}>
                <ReviewRow label={isAR ? "نوع الرحلة" : "Trip Type"} value={tripLabel} />
                <ReviewRow label={isAR ? "مسار" : "Route"} value={`${locationLabel(lang, from)} → ${locationLabel(lang, to)}`} />
                <ReviewRow label={isAR ? "المغادرة" : "Departure"} value={`${date} at ${time}`} />
                {needsReturn && <ReviewRow label={isAR ? "العودة" : "Return"} value={`${returnDate || "-"} at ${returnTime || "-"}`} />}
                <ReviewRow label={isAR ? "السيارة" : "Vehicle"} value={`${vehicle.name} (${isAR ? vehicle.categoryAr : vehicle.category})`} />
                <ReviewRow label={isAR ? "ركاب / حقائب" : "Pax / Bags"} value={`${pax} / ${luggage}`} />
                <img src={vehicle.image} alt={vehicle.name} className="mt-3 h-28 w-full rounded-xl bg-white object-contain p-2" style={{ direction: "ltr" }} />
              </ReviewSection>

              <ReviewSection title={isAR ? "بيانات التواصل" : "Contact Details"} hFamily={hFamily}>
                <ReviewRow label={isAR ? "الفندق" : "Hotel"} value={hotel + (room ? ` (Room ${room})` : "")} />
                <ReviewRow label={isAR ? "الاسم" : "Name"} value={name} />
                <ReviewRow label="WhatsApp" value={phone} dir="ltr" />
                {email && <ReviewRow label="Email" value={email} dir="ltr" />}
                {isAirportArrival && <ReviewRow label={isAR ? "رقم الرحلة" : "Flight"} value={flight} />}
                {needsPermit && <ReviewRow label={isAR ? "جواز السفر" : "Passport/ID"} value={passport} />}
                {notes && <ReviewRow label={isAR ? "ملاحظات" : "Notes"} value={notes} />}
              </ReviewSection>

              {breakdown && (
                <div className="mt-4 rounded-xl bg-lux-green/5 border border-lux-green/20 p-5">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3" style={{ fontFamily: hFamily }}>
                    {isAR ? "تفصيل السعر" : "Price Breakdown"}
                  </h3>
                  <PriceTable breakdown={breakdown} route={route} isAR={isAR} hFamily={hFamily} />
                </div>
              )}

              <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">{isAR ? "سياسة الإلغاء" : "Cancellation Policy"}</p>
                <p>{isAR ? "استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة." : "Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time."}</p>
              </div>
            </div>

            {/* THE ONE SUBMIT BUTTON */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 mb-5">
                {isAR
                  ? "سيتم إرسال طلب الحجز إلى LuxRide عبر واتساب والبريد الإلكتروني."
                  : "Your booking request will be sent to LuxRide through WhatsApp and email."}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-lux-green px-10 py-4 text-white shadow-lg shadow-lux-green/30 transition-all hover:brightness-110"
                style={{ fontFamily: hFamily, fontWeight: 800, fontSize: "1.15rem" }}
              >
                <Send className="h-5 w-5" />
                {isAR ? "إرسال طلب الحجز" : "Send Booking Request"}
              </button>
              <p className="mt-3 text-xs text-gray-400">
                {isAR ? "سيتواصل معك فريق LuxRide لتأكيد التفاصيل قريباً." : "LuxRide will contact you to confirm the details shortly."}
              </p>
            </div>

            <div className="flex justify-start">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-gray-600 hover:border-lux-green hover:text-lux-green transition-all">
                <ArrowLeft className="h-5 w-5" /> {isAR ? "رجوع لتعديل البيانات" : "Back to Edit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  labelCls,
  note,
  children,
}: {
  label: string;
  labelCls: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {note && <span className="mt-1 block text-xs text-gray-500">{note}</span>}
    </label>
  );
}

function ReviewSection({
  title,
  hFamily,
  children,
}: {
  title: string;
  hFamily: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-xl bg-gray-50 p-5 space-y-3 text-sm">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3" style={{ fontFamily: hFamily }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800 text-end font-medium" dir={dir}>{value || "-"}</span>
    </div>
  );
}

function PriceTable({
  breakdown,
  route,
  isAR,
  hFamily,
}: {
  breakdown: NonNullable<ReturnType<typeof computePrice>>;
  route: ReturnType<typeof findRoute>;
  isAR: boolean;
  hFamily: string;
}) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>{isAR ? "السعر الأساسي" : "Base price"}</span>
        <span>{formatEur(breakdown.base)}</span>
      </div>
      {breakdown.discount > 0 && (
        <div className="flex justify-between text-lux-orange">
          <span>{isAR ? "خصم" : "Discount"} ({route?.discountPct}%)</span>
          <span>-{formatEur(breakdown.discount)}</span>
        </div>
      )}
      {breakdown.discount > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "المجموع بعد الخصم" : "Discounted subtotal"}</span>
          <span>{formatEur(breakdown.subtotal)}</span>
        </div>
      )}
      {breakdown.airport > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "رسوم المطار" : "Airport surcharge"}</span>
          <span>{formatEur(breakdown.airport)}</span>
        </div>
      )}
      {breakdown.permit > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "تصريح السفر" : "Travel permit"}</span>
          <span>{formatEur(breakdown.permit)}</span>
        </div>
      )}
      {breakdown.overnight > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "مبيت السائق" : "Driver overnight"}</span>
          <span>{formatEur(breakdown.overnight)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3">
        <span className="font-semibold text-lux-charcoal">{isAR ? "الإجمالي النهائي" : "Final Total"}</span>
        <span className="text-lux-green" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
          {formatEur(breakdown.total)}
        </span>
      </div>
    </div>
  );
}
