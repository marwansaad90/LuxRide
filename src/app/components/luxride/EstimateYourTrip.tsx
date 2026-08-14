import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, Luggage, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router";
import {
  PublicTripType,
  ROUTES,
  Route,
  VehicleId,
  availablePublicTripTypes,
  computePrice,
  destinationsFor,
  destinationsForRoutes,
  findRoute,
  findRouteIn,
  pickupLocationsFor,
  routeFromApiRoute,
  pickupLocations,
  resolveTripType,
  tripRulesFor,
} from "./data";
import { useVehicles } from "./cms";
import { formatEur } from "./bookingState";
import { locationLabel, useLang } from "./i18n";
import { VehicleSegmentedSelector } from "./VehicleSegmentedSelector";

const PICKUPS = pickupLocations();

export function EstimateYourTrip() {
  const lang = useLang();
  const navigate = useNavigate();
  const isAR = lang === "AR";

  const [publicTrip, setPublicTrip] = useState<PublicTripType>("oneWay");
  const [from, setFrom] = useState(PICKUPS[0]);
  const [dests, setDests] = useState(() => destinationsFor(PICKUPS[0]));
  const [to, setTo] = useState(() => destinationsFor(PICKUPS[0])[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [vehicleId, setVehicleId] = useState<VehicleId>("xpander");
  const [pax, setPax] = useState("2");
  const [luggage, setLuggage] = useState("2");
  const [notice, setNotice] = useState("");
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const vehicles = useVehicles();

  const pickups = useMemo(() => pickupLocationsFor(routes), [routes]);
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];
  const route = findRouteIn(routes, from, to) ?? findRoute(from, to);
  const supportedTrips = useMemo(() => availablePublicTripTypes(route), [route]);
  const trip = useMemo(() => resolveTripType(route, publicTrip), [route, publicTrip]);
  const tripRules = useMemo(() => tripRulesFor(route), [route]);
  const breakdown = useMemo(
    () => (route && vehicle && trip ? computePrice(route, trip, vehicle) : null),
    [route, trip, vehicle],
  );
  const todayLocal = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/wp-json/luxride/v1/routes", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.routes) || payload.routes.length === 0) return;
        setRoutes(payload.routes.map(routeFromApiRoute));
      })
      .catch(() => {
        // Local Vite and static previews do not serve WordPress REST. Keep the compiled workbook fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!pickups.length || pickups.includes(from)) return;
    const nextFrom = pickups[0];
    const nextDests = destinationsForRoutes(routes, nextFrom);
    setFrom(nextFrom);
    setDests(nextDests);
    setTo(nextDests[0] ?? "");
  }, [from, pickups, routes]);

  useEffect(() => {
    if (!route || supportedTrips.includes(publicTrip)) return;
    const nextTrip = supportedTrips[0] ?? "oneWay";
    setPublicTrip(nextTrip);
    setNotice(isAR ? "تم تحديث اختيار التوصيلة حسب المسار المحدد." : "Transfer choice was updated for the selected route.");
  }, [isAR, publicTrip, route, supportedTrips]);

  function clampForVehicle(id: VehicleId) {
    const nextVehicle = vehicles.find((v) => v.id === id);
    if (!nextVehicle) return;
    const nextPax = Math.min(Number(pax), nextVehicle.pax);
    const nextLuggage = Math.min(Number(luggage), nextVehicle.luggage);
    setVehicleId(id);
    setPax(String(nextPax));
    setLuggage(String(nextLuggage));
    setNotice(
      nextPax !== Number(pax) || nextLuggage !== Number(luggage)
        ? (isAR
          ? "تم تحديث حدود الركاب والحقائب للسيارة المحددة."
          : "Passenger and luggage limits were updated for the selected vehicle.")
        : "",
    );
  }

  function handlePickup(value: string) {
    setFrom(value);
    const nextDests = destinationsForRoutes(routes, value);
    setDests(nextDests);
    setTo(nextDests.includes(to) ? to : nextDests[0]);
  }

  function handleContinue() {
    if (!breakdown || !date || !time || !vehicle) return;
    const params = new URLSearchParams({
      trip: publicTrip,
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

  const tripTypes: { id: PublicTripType; label: string; desc: string }[] = [
    { id: "oneWay", label: isAR ? "ذهاب فقط" : "One Way", desc: isAR ? "توصيلة واحدة" : "Single transfer" },
    { id: "roundTrip", label: isAR ? "ذهاب وعودة" : "Round Trip", desc: isAR ? "عودة حسب تصنيف المسار" : "Return transfer by route rule" },
  ];
  const classificationLabel =
    tripRules?.roundTripMode === "overday"
      ? (isAR ? "جولة يوم كامل" : "Overday")
      : tripRules?.roundTripMode === "overnight"
      ? (isAR ? "مبيت" : "Overnight")
      : "";

  const inputCls =
    "h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-lux-charcoal transition-all focus:border-lux-green focus:outline-none focus:ring-2 focus:ring-lux-green/25";
  const labelCls = "mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700";

  return (
    <div
      id="estimate"
      tabIndex={-1}
      className="scroll-mt-24 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_22px_70px_rgba(15,22,35,0.22)] backdrop-blur-md sm:p-4"
    >
      <div className="mb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-lux-green">
          {isAR ? "حاسبة السعر" : "Quick Price Estimate"}
        </p>
        <h2 className="mt-0.5 text-lux-charcoal" style={{ fontSize: "1.32rem", fontWeight: 800, lineHeight: 1.1 }}>
          {isAR ? "قدّر توصيلتك" : "Estimate Your Trip"}
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <span className={labelCls}>{isAR ? "نوع التوصيلة" : "Transfer type"}</span>
          <div role="radiogroup" aria-label={isAR ? "نوع التوصيلة" : "Transfer type"} className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
            {tripTypes.map((tt) => {
              const supported = supportedTrips.includes(tt.id);
              const selected = publicTrip === tt.id;
              const disabledReason = isAR ? "غير متاح لهذا المسار" : "Not available for this route";
              return (
                <button
                  key={tt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-disabled={!supported}
                  title={supported ? tt.desc : disabledReason}
                  disabled={!supported}
                  onClick={() => setPublicTrip(tt.id)}
                  className={`min-h-9 rounded-lg px-1.5 py-1.5 text-center text-xs font-semibold transition-all ${
                    !supported
                      ? "cursor-not-allowed text-gray-400"
                      : selected
                      ? "bg-lux-green text-white shadow-sm"
                      : "text-gray-700 hover:bg-white hover:text-lux-green"
                  }`}
                >
                  <span className="block leading-tight">{tt.label}</span>
                  <span className="sr-only">{supported ? tt.desc : disabledReason}</span>
                </button>
              );
            })}
          </div>
          {publicTrip === "roundTrip" && classificationLabel && (
            <p className="mt-2 rounded-lg border border-lux-green/20 bg-lux-green/5 px-3 py-1.5 text-xs font-medium text-lux-charcoal">
              {isAR ? `تصنيف المسار: ${classificationLabel}` : `Route classification: ${classificationLabel}`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div>
            <label htmlFor="estimate-from" className={labelCls}>
              <MapPin className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "موقع الانطلاق" : "Pickup"}
            </label>
            <select id="estimate-from" value={from} onChange={(event) => handlePickup(event.target.value)} className={inputCls}>
              {pickups.map((pickup) => (
                <option key={pickup} value={pickup}>{locationLabel(lang, pickup)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estimate-to" className={labelCls}>
              <MapPin className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "الوجهة" : "Destination"}
            </label>
            <select id="estimate-to" value={to} onChange={(event) => setTo(event.target.value)} className={inputCls}>
              {dests.map((destination) => (
                <option key={destination} value={destination}>{locationLabel(lang, destination)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estimate-date" className={labelCls}>
              <CalendarDays className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "تاريخ التوصيلة" : "Date"}
            </label>
            <input id="estimate-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputCls} min={todayLocal} />
          </div>
          <div>
            <label htmlFor="estimate-time" className={labelCls}>
              <Clock className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "وقت الانطلاق" : "Pickup time"}
            </label>
            <input id="estimate-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <span className={labelCls}>{isAR ? "السيارة" : "Vehicle"}</span>
          <VehicleSegmentedSelector id="estimate-vehicle" lang={lang} value={vehicleId} onChange={clampForVehicle} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="estimate-passengers" className={labelCls}>
              <Users className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "ركاب" : "Passengers"}
            </label>
            <select id="estimate-passengers" value={pax} onChange={(event) => setPax(event.target.value)} className={inputCls}>
              {Array.from({ length: vehicle.pax }, (_, index) => index + 1).map((count) => (
                <option key={count} value={String(count)}>{count}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estimate-luggage" className={labelCls}>
              <Luggage className="h-3.5 w-3.5 text-lux-green" />
              {isAR ? "حقائب" : "Bags"}
            </label>
            <select id="estimate-luggage" value={luggage} onChange={(event) => setLuggage(event.target.value)} className={inputCls}>
              {Array.from({ length: vehicle.luggage + 1 }, (_, index) => index).map((count) => (
                <option key={count} value={String(count)}>{count}</option>
              ))}
            </select>
          </div>
        </div>

        {notice && (
          <p role="status" aria-live="polite" className="rounded-lg border border-lux-orange/30 bg-orange-50 px-3 py-1.5 text-xs text-gray-700">
            {notice}
          </p>
        )}

        <div className="rounded-xl bg-gray-50 p-3">
          {breakdown ? (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-gray-500">
                  {isAR ? "السعر الثابت المقدّر" : "Estimated fixed price"}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  {breakdown.discount > 0 && <span className="text-sm text-gray-400 line-through">{formatEur(breakdown.base)}</span>}
                  <span className="text-lux-green" style={{ fontSize: "1.65rem", fontWeight: 800 }}>
                    {formatEur(breakdown.total)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {isAR ? "شامل الضريبة · سعر ثابت" : "Tax included · fixed price"}
                  {breakdown.airport > 0 && ` · +${formatEur(breakdown.airport)} ${isAR ? "رسوم مطار" : "airport"}`}
                  {breakdown.permit > 0 && ` · +${formatEur(breakdown.permit)} ${isAR ? "تصريح" : "permit"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!date || !time}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-lux-green px-4 py-2 text-sm font-bold text-white shadow-md shadow-lux-green/25 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAR ? "المتابعة لتفاصيل التوصيلة" : "Continue to Transfer Details"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{isAR ? "هذا النوع غير متاح لهذا المسار." : "This trip type is not available for the selected route."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
