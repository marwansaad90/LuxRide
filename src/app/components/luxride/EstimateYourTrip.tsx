import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, Luggage, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router";
import {
  FLEET,
  TripType,
  VehicleId,
  availableTripTypes,
  computePrice,
  destinationsFor,
  findRoute,
  pickupLocations,
} from "./data";
import { formatEur } from "./bookingState";
import { locationLabel, useLang } from "./i18n";

const PICKUPS = pickupLocations();

export function EstimateYourTrip() {
  const lang = useLang();
  const navigate = useNavigate();
  const isAR = lang === "AR";

  const [trip, setTrip] = useState<TripType>("oneWay");
  const [from, setFrom] = useState(PICKUPS[0]);
  const [dests, setDests] = useState(() => destinationsFor(PICKUPS[0]));
  const [to, setTo] = useState(() => destinationsFor(PICKUPS[0])[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicleId, setVehicleId] = useState<VehicleId>("xpander");
  const [pax, setPax] = useState("2");
  const [luggage, setLuggage] = useState("2");

  const vehicle = FLEET.find((v) => v.id === vehicleId)!;
  const route = findRoute(from, to);
  const breakdown = useMemo(
    () => (route ? computePrice(route, trip, vehicle) : null),
    [route, trip, vehicle],
  );
  const supportedTrips = useMemo(() => availableTripTypes(route), [route]);
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    if (route && !supportedTrips.includes(trip)) {
      setTrip(supportedTrips[0] ?? "oneWay");
    }
  }, [route, supportedTrips, trip]);

  function handlePickup(value: string) {
    setFrom(value);
    const d = destinationsFor(value);
    setDests(d);
    if (!d.includes(to)) setTo(d[0]);
  }

  function handleContinue() {
    if (!breakdown || !date || !time || !vehicle.available) return;
    const params = new URLSearchParams({
      trip,
      from,
      to,
      date,
      time,
      vehicle: vehicleId,
      pax,
      luggage,
    });
    navigate(`/booking?${params.toString()}`);
  }

  const tripTypes: { id: TripType; label: string }[] = [
    { id: "oneWay", label: isAR ? "ذهاب فقط" : "One Way" },
    { id: "overday", label: isAR ? "يوم كامل" : "Overday" },
    { id: "overnight", label: isAR ? "مبيت" : "Overnight" },
  ];

  const inputCls =
    "w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-lux-charcoal text-sm focus:border-lux-green focus:outline-none focus:ring-2 focus:ring-lux-green/20 transition-all";

  const labelCls = "mb-1.5 block text-sm font-semibold text-gray-700";

  const maxPax = vehicle.pax;
  const maxLuggage = vehicle.luggage;

  return (
    <section id="estimate" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-lux-green">
            <span className="h-px w-6 bg-lux-green" />
            {isAR ? "احسب سعر رحلتك" : "Quick Price Estimate"}
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
            {isAR ? "قدّر رحلتك" : "Estimate Your Trip"}
          </h2>
          <p className="mt-2 text-gray-500" style={{ fontSize: "1rem" }}>
            {isAR
              ? "اختر وجهتك وسيارتك للحصول على السعر الثابت فوراً"
              : "Select your route and vehicle to see your fixed price instantly"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
          {/* Trip type tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {tripTypes.map((tt) => (
              <button
                type="button"
                key={tt.id}
                onClick={() => setTrip(tt.id)}
                disabled={!supportedTrips.includes(tt.id)}
                className={`flex-1 py-3.5 text-sm font-medium transition-all ${
                  !supportedTrips.includes(tt.id)
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : trip === tt.id
                    ? "bg-lux-green text-white"
                    : "text-gray-500 hover:text-lux-green"
                }`}
                style={{ fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
              >
                {tt.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Pickup */}
              <div>
                <label htmlFor="estimate-from" className={labelCls}>
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {isAR ? "موقع الانطلاق" : "Pickup Location"}
                </label>
                <select
                  id="estimate-from"
                  value={from}
                  onChange={(e) => handlePickup(e.target.value)}
                  className={inputCls}
                >
                  {PICKUPS.map((p) => (
                      <option key={p} value={p}>{locationLabel(lang, p)}</option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label htmlFor="estimate-to" className={labelCls}>
                  <MapPin className="inline h-3 w-3 mr-1" />
                  {isAR ? "الوجهة" : "Destination"}
                </label>
                <select
                  id="estimate-to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputCls}
                >
                  {dests.map((d) => (
                      <option key={d} value={d}>{locationLabel(lang, d)}</option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <label htmlFor="estimate-vehicle" className={labelCls}>
                  {isAR ? "السيارة" : "Vehicle"}
                </label>
                <select
                  id="estimate-vehicle"
                  value={vehicleId}
                  onChange={(e) => {
                    const v = FLEET.find((f) => f.id === e.target.value);
                    if (v && !v.available) return;
                    setVehicleId(e.target.value as VehicleId);
                    const newV = FLEET.find((f) => f.id === e.target.value)!;
                    if (parseInt(pax) > newV.pax) setPax(String(newV.pax));
                    if (parseInt(luggage) > newV.luggage) setLuggage(String(newV.luggage));
                  }}
                  className={inputCls}
                >
                  {FLEET.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.available}>
                      {v.name} — {isAR ? v.capacityAr : v.capacityEn}{!v.available ? ` (${isAR ? "قريباً" : "Coming Soon"})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="estimate-date" className={labelCls}>
                  <CalendarDays className="inline h-3 w-3 mr-1" />
                  {isAR ? "تاريخ الرحلة" : "Transfer Date"}
                </label>
                <input
                  id="estimate-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                  min={todayLocal}
                />
              </div>

              {/* Time */}
              <div>
                <label htmlFor="estimate-time" className={labelCls}>
                  <Clock className="inline h-3 w-3 mr-1" />
                  {isAR ? "وقت الانطلاق" : "Pickup Time"}
                </label>
                <input
                  id="estimate-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Passengers + Luggage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="estimate-passengers" className={labelCls}>
                    <Users className="inline h-3 w-3 mr-1" />
                    {isAR ? "ركاب" : "Passengers"}
                  </label>
                  <select
                    id="estimate-passengers"
                    value={pax}
                    onChange={(e) => setPax(e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="estimate-luggage" className={labelCls}>
                    <Luggage className="inline h-3 w-3 mr-1" />
                    {isAR ? "حقائب" : "Bags"}
                  </label>
                  <select
                    id="estimate-luggage"
                    value={luggage}
                    onChange={(e) => setLuggage(e.target.value)}
                    className={inputCls}
                  >
                    {Array.from({ length: maxLuggage + 1 }, (_, i) => i).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Price preview + CTA */}
            <div className="mt-6 flex flex-col gap-4 rounded-xl bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {breakdown ? (
                  <>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {isAR ? "السعر الثابت المقدّر" : "Estimated fixed price"}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      {breakdown.discount > 0 && (
                        <span className="text-gray-400 line-through text-sm">{formatEur(breakdown.base)}</span>
                      )}
                      <span
                        className="text-lux-green"
                        style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "2rem" }}
                      >
                        {formatEur(breakdown.total)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isAR ? "شامل الضريبة · سعر ثابت" : "Tax included · fixed price"}
                      {breakdown.airport > 0 && ` · +€${breakdown.airport} ${isAR ? "رسوم مطار" : "airport fee"}`}
                      {breakdown.permit > 0 && ` · +€${breakdown.permit} ${isAR ? "تصريح" : "permit"}`}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    {isAR ? "اختر الوجهة لرؤية السعر" : "Select a route to see the price"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleContinue}
                disabled={!breakdown || !date || !time || !vehicle.available}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white shadow-md shadow-lux-green/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.05rem" }}
              >
                {isAR ? "المتابعة لتفاصيل الرحلة" : "Continue to Trip Details"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
