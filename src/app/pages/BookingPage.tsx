import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Send,
  Users,
} from "lucide-react";
import {
  BOOKING_CUTOFF_HOURS,
  FLEET,
  PublicTripType,
  ROUTES,
  Route,
  VehicleId,
  computePrice,
  destinationsFor,
  destinationsForRoutes,
  findRoute,
  findRouteIn,
  isVehicleSelectable,
  pickupLocationsFor,
  routeFromApiRoute,
  resolveTripType,
} from "../components/luxride/data";
import { addDays, formatEur, isValidReturn, isWithinLeadTime, normalizeReturnFields, readInitialBookingState, todayInBookingTimeZone } from "../components/luxride/bookingState";
import { settingsWhatsappLink, useSiteSettings, useVehicles } from "../components/luxride/cms";
import { locationLabel, useLang } from "../components/luxride/i18n";
import { PageShell } from "../components/luxride/PageShell";
import { vehicleSegmentLabel, VehicleSegmentedSelector } from "../components/luxride/VehicleSegmentedSelector";
import { WhatsAppIcon } from "../components/luxride/WhatsAppIcon";
import { LocationSearchInput } from "../components/luxride/LocationSearchInput";

type Step = 1 | 2 | 3;

interface ServerQuote {
  route: {
    pickup: { label: string; ar?: string };
    destination: { label: string; ar?: string };
    recommended_trip_type?: string;
    trip_name_one_way?: string;
    trip_name_return?: string;
    trip_name_one_way_ar?: string;
    trip_name_return_ar?: string;
  };
  trip_type: "one_way" | "round_trip";
  classification: "one_way" | "overday" | "overnight";
  vehicle: { key: string; label: string };
  pricing: {
    base: number;
    original_base?: number;
    discount: number;
    promotion?: {
      has_promotion: boolean;
      promotion_name?: string;
      promotion_discount_amount?: number;
      promotion_discount_percent?: number;
      promotional_amount?: number;
    };
    promotional_base?: number;
    airport_fee: number;
    permit_fee: number;
    accommodation: { nights: number; price_per_night: number; total: number };
    accommodation_fee: number;
    original_total?: number;
    promotional_total?: number;
    child_seat: { requested: boolean; price: number; label: string; label_ar: string };
    total: number;
    currency: string;
    taxes_included: boolean;
  };
  required_fields: string[];
}

interface TurnstilePublicSettings {
  enabled: boolean;
  site_key: string;
  mode: "managed";
  minimum_lead_hours: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `lxr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function BookingPage() {
  const lang = useLang();
  const isAR = lang === "AR";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const settings = useSiteSettings();
  const vehicles = useVehicles();
  const initial = useMemo(() => readInitialBookingState(searchParams), [searchParams]);
  const [routes, setRoutes] = useState<Route[]>(ROUTES);
  const [pickupOrder, setPickupOrder] = useState<string[] | null>(null);

  // ── Step 1 state (pre-filled from URL params) ──────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [publicTrip, setPublicTrip] = useState<PublicTripType>(initial.publicTrip);
  const [from, setFrom] = useState(initial.from);
  const [dests, setDests] = useState(() => (initial.from ? destinationsFor(initial.from) : []));
  const [to, setTo] = useState(initial.to);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [returnDate, setReturnDate] = useState(initial.returnDate);
  const [returnTime, setReturnTime] = useState(initial.returnTime);
  const [vehicleId, setVehicleId] = useState<VehicleId>(initial.vehicleId);
  const [pax, setPax] = useState(initial.pax);
  const [luggage, setLuggage] = useState(initial.luggage);
  const [capacityNotice, setCapacityNotice] = useState(false);

  // ── Step 2 state ────────────────────────────────────────────────────────────
  const [hotel, setHotel] = useState("");
  const [room, setRoom] = useState("");
  const [flight, setFlight] = useState("");
  const [passport, setPassport] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [childSeat, setChildSeat] = useState(false);
  const [serverQuote, setServerQuote] = useState<ServerQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [priceChangedNotice, setPriceChangedNotice] = useState("");
  const [idempotencyKey] = useState(makeIdempotencyKey);
  const [step1Errors, setStep1Errors] = useState<{ pickup?: string; destination?: string; date?: string; time?: string; leadTime?: string }>({});
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [turnstile, setTurnstile] = useState<TurnstilePublicSettings>({ enabled: false, site_key: "", mode: "managed", minimum_lead_hours: BOOKING_CUTOFF_HOURS });
  const [turnstileToken, setTurnstileToken] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const routePickups = useMemo(() => pickupLocationsFor(routes), [routes]);
  const pickups = useMemo(() => {
    if (!pickupOrder) return routePickups;
    const available = new Set(routePickups);
    const explicit = pickupOrder.filter((pickup) => available.has(pickup));
    const seen = new Set(explicit);
    return [...explicit, ...routePickups.filter((pickup) => !seen.has(pickup))];
  }, [pickupOrder, routePickups]);
  const allLocations = useMemo(() => Array.from(new Set(routes.flatMap((item) => [item.from, item.to]))), [routes]);
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0] ?? FLEET[0];
  const route = findRouteIn(routes, from, to) ?? findRoute(from, to);
  const trip = useMemo(() => resolveTripType(route, publicTrip), [route, publicTrip]);
  const breakdown = useMemo(
    () => (route && trip ? computePrice(route, trip, vehicle, date && time ? `${date} ${time}` : "") : null),
    [date, route, time, trip, vehicle],
  );
  const isAirportArrival = from === "Hurghada Airport";
  const needsPermit = !!route?.permit;
  const needsReturn = trip === "overday" || trip === "overnight";
  const todayLocal = useMemo(() => todayInBookingTimeZone(), []);
  const leadHours = Math.max(1, Math.round(turnstile.minimum_lead_hours || BOOKING_CUTOFF_HOURS));
  const leadHoursText = `${leadHours} ${leadHours === 1 ? "hour" : "hours"}`;
  const leadHoursArabic = `${leadHours} ${leadHours === 1 ? "ساعة" : "ساعات"}`;
  const leadTimeMessage = isAR
    ? `الحجز القياسي يتطلب ${leadHoursArabic} على الأقل قبل الانطلاق. تواصل معنا للتوفر العاجل.`
    : `Standard booking requires at least ${leadHoursText} before departure. Contact us for last-minute availability.`;

  const tooSoon = useMemo(() => {
    if (!date || !time) return false;
    return isWithinLeadTime(date, time, turnstile.minimum_lead_hours);
  }, [date, time, turnstile.minimum_lead_hours]);

  const hasValidReturn = trip ? isValidReturn(trip, date, time, returnDate, returnTime) : false;
  const vehicleSelectable = vehicle ? isVehicleSelectable(vehicle) : false;
  const step1Valid = !!(from && to && route && date && time && breakdown && vehicleSelectable);
  const step2Valid =
    hotel.trim().length > 0 &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    (!email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) &&
    (!isAirportArrival || flight.trim().length > 0) &&
    (!needsPermit || passport.trim().length > 0) &&
    hasValidReturn;

  const quotePayload = useCallback(() => ({
    pickup: from,
    destination: to,
    trip_type: publicTrip === "roundTrip" ? "round_trip" : "one_way",
    vehicle: vehicleId,
    passengers: Number(pax),
    bags: Number(luggage),
    outbound_datetime: date && time ? `${date} ${time}` : "",
    return_datetime: needsReturn && returnDate && returnTime ? `${returnDate} ${returnTime}` : "",
    child_seat: childSeat,
  }), [childSeat, date, from, luggage, needsReturn, pax, publicTrip, returnDate, returnTime, time, to, vehicleId]);

  const requestQuote = useCallback(async (showErrors = true) => {
    if (!step1Valid || (needsReturn && !hasValidReturn)) return null;
    setQuoteLoading(true);
    setQuoteError("");
    try {
      const response = await fetch("/wp-json/luxride/v1/quote", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(quotePayload()),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const code = payload?.code;
        const message =
          code === "luxride_last_minute" || code === "last_minute_required"
            ? leadTimeMessage
            : code === "luxride_daily_limit_reached"
            ? (isAR
              ? String(payload?.details?.message_ar ?? "تم الوصول إلى الحد الأقصى للحجوزات المؤكدة لهذا اليوم. يرجى اختيار تاريخ آخر.")
              : String(payload?.message ?? "This date has reached the maximum number of confirmed bookings. Please choose another date."))
            : isAR && payload?.details?.message_ar
            ? String(payload.details.message_ar)
            : (payload?.message ?? (isAR ? "تعذر تحديث السعر من الخادم." : "Could not refresh the server price."));
        if (showErrors) setQuoteError(message);
        setServerQuote(null);
        return null;
      }
      setServerQuote(payload as ServerQuote);
      return payload as ServerQuote;
    } catch {
      if (showErrors) setQuoteError(isAR ? "تعذر الاتصال بخادم التسعير." : "Could not reach the pricing server.");
      setServerQuote(null);
      return null;
    } finally {
      setQuoteLoading(false);
    }
  }, [hasValidReturn, isAR, leadTimeMessage, needsReturn, quotePayload, step1Valid]);

  useEffect(() => {
    let active = true;
    fetch("/wp-json/luxride/v1/routes", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.routes) || payload.routes.length === 0) return;
        const nextRoutes = payload.routes.map(routeFromApiRoute);
        setRoutes(nextRoutes);
        if (Array.isArray(payload.pickup_locations)) {
          setPickupOrder(payload.pickup_locations.map((pickup: { label?: string }) => String(pickup?.label ?? "")).filter(Boolean));
        }
      })
      .catch(() => {
        // Static and Vite previews use the compiled workbook fallback.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/wp-json/luxride/v1/public-settings", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!active || !payload?.turnstile) return;
        setTurnstile({
          enabled: Boolean(payload.turnstile.enabled),
          site_key: String(payload.turnstile.site_key ?? ""),
          mode: "managed",
          minimum_lead_hours: Math.max(1, Number(payload.minimum_lead_hours) || BOOKING_CUTOFF_HOURS),
        });
      })
      .catch(() => {
        // Turnstile is optional until production keys are configured.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!turnstile.enabled || !turnstile.site_key || step !== 3) return;
    if (!document.querySelector('script[data-luxride-turnstile="true"]')) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.luxrideTurnstile = "true";
      document.head.appendChild(script);
    }

    let cancelled = false;
    const timer = window.setInterval(() => {
      if (cancelled || !turnstileRef.current || !window.turnstile || turnstileWidgetRef.current) return;
      turnstileWidgetRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstile.site_key,
        size: "flexible",
        theme: "light",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => setTurnstileToken(""),
      });
      window.clearInterval(timer);
    }, 200);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (turnstileWidgetRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetRef.current);
        turnstileWidgetRef.current = null;
        setTurnstileToken("");
      }
    };
  }, [step, turnstile.enabled, turnstile.site_key]);

  function resetTurnstile() {
    setTurnstileToken("");
    if (turnstileWidgetRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetRef.current);
    }
  }

  useEffect(() => {
    const nextDests = from && pickups.includes(from) ? destinationsForRoutes(routes, from) : [];
    setDests(nextDests);
    if (to && !nextDests.includes(to)) setTo("");
  }, [from, pickups, routes, to]);

  useEffect(() => {
    setServerQuote(null);
    setQuoteError("");
    setPriceChangedNotice("");
    setAvailabilityError("");
  }, [childSeat, date, from, luggage, pax, publicTrip, returnDate, returnTime, time, to, vehicleId]);

  useEffect(() => {
    if (step === 3) void requestQuote(false);
  }, [requestQuote, step]);

  useEffect(() => {
    if (step !== 2 || tooSoon || !step1Valid || (needsReturn && !hasValidReturn)) return;
    const timer = window.setTimeout(() => {
      void requestQuote(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [hasValidReturn, needsReturn, requestQuote, step, step1Valid, tooSoon]);

  function handlePickup(value: string) {
    setFrom(value);
    setStep1Errors((current) => ({ ...current, pickup: undefined, destination: undefined }));
    const d = pickups.includes(value) ? destinationsForRoutes(routes, value) : [];
    setDests(d);
    if (to && !d.includes(to)) setTo("");
  }

  function handleDestination(value: string) {
    setTo(value);
    setStep1Errors((current) => ({ ...current, destination: undefined }));
  }

  function handleVehicleChange(id: VehicleId) {
    const v = vehicles.find((f) => f.id === id);
    if (!v || !isVehicleSelectable(v)) {
      setCapacityNotice(false);
      return;
    }
    setVehicleId(id);
    const exceedsCapacity = parseInt(pax) > v.pax || parseInt(luggage) > v.luggage;
    if (parseInt(pax) > v.pax) setPax(String(v.pax));
    if (parseInt(luggage) > v.luggage) setLuggage(String(v.luggage));
    setCapacityNotice(exceedsCapacity);
  }

  useEffect(() => {
    const normalized = normalizeReturnFields(trip ?? "oneWay", date, returnDate, returnTime);
    if (normalized.returnDate !== returnDate) setReturnDate(normalized.returnDate);
    if (normalized.returnTime !== returnTime) setReturnTime(normalized.returnTime);
  }, [date, returnDate, returnTime, trip]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const tripLabel = publicTrip === "roundTrip" ? (isAR ? "ذهاب وعودة" : "Round Trip") : (isAR ? "ذهاب فقط" : "One Way");
  const tripClassificationLabel = publicTrip === "roundTrip"
    ? (isAR ? route?.returnClassificationAr : route?.returnClassification)
    : (isAR ? route?.outboundClassificationAr : route?.outboundClassification);

  async function handleStep1Next() {
    const nextErrors: typeof step1Errors = {};
    if (!from || !pickups.includes(from)) {
      nextErrors.pickup = isAR ? "يرجى اختيار موقع انطلاق من القائمة." : "Please choose a pickup location from the list.";
    }
    if (!to || !route) {
      nextErrors.destination = isAR ? "يرجى اختيار وجهة متاحة لهذا الانطلاق." : "Please choose an available destination for this pickup.";
    }
    if (!date) nextErrors.date = isAR ? "يرجى اختيار تاريخ المغادرة." : "Please select a departure date.";
    if (!time) nextErrors.time = isAR ? "يرجى اختيار وقت الانطلاق." : "Please select a pickup time.";
    if (date && time && tooSoon) {
      nextErrors.leadTime = isAR
        ? `الحجز القياسي يتطلب ${leadHoursArabic} على الأقل قبل الانطلاق بتوقيت القاهرة.`
        : `Standard booking requires at least ${leadHoursText} before departure in Cairo time.`;
    }
    if (!vehicleSelectable) {
      nextErrors.leadTime = isAR ? "السيارة المحددة غير متاحة للحجز حالياً." : "The selected vehicle is temporarily unavailable for booking.";
    }
    setStep1Errors(nextErrors);
    if (nextErrors.pickup || nextErrors.destination) return;
    if (nextErrors.date) {
      dateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      dateRef.current?.focus();
      return;
    }
    if (nextErrors.time) {
      timeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      timeRef.current?.focus();
      return;
    }
    if (nextErrors.leadTime || !breakdown) return;

    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const response = await fetch("/wp-json/luxride/v1/availability", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle: vehicleId,
          outbound_datetime: `${date} ${time}`,
          return_datetime: needsReturn && returnDate && returnTime ? `${returnDate} ${returnTime}` : "",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.available !== true) {
        const message = isAR
          ? String(payload?.details?.message_ar ?? "السيارة المحددة غير متاحة في هذا الوقت. اختر وقتاً آخر أو سيارة أخرى.")
          : String(payload?.message ?? "The selected vehicle is unavailable for this time. Choose another time or vehicle.");
        setAvailabilityError(message);
        return;
      }
      setStep(2);
    } catch {
      setAvailabilityError(isAR ? "تعذر التحقق من توفر السيارة. حاول مرة أخرى." : "Could not check vehicle availability. Please try again.");
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function handleSubmit() {
    if (!step1Valid || !step2Valid) {
      setStep(step1Valid ? 2 : 1);
      return;
    }

    setSubmitError("");
    setPriceChangedNotice("");
    const quote = serverQuote ?? await requestQuote(true);
    if (!quote) {
      return;
    }
    if (turnstile.enabled && !turnstileToken) {
      setSubmitError(isAR ? "يرجى إكمال فحص أمان الحجز." : "Please complete the booking security check.");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch("/wp-json/luxride/v1/bookings", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quotePayload(),
          language: lang,
          idempotency_key: idempotencyKey,
          review_total: quote.pricing.total,
          turnstile_token: turnstileToken,
          customer: { full_name: name, phone, email },
          details: {
            exact_location: hotel,
            room_number: room,
            flight_number: flight,
            passport_or_id: passport,
            notes,
            child_seat: childSeat,
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        if (payload?.code === "price_changed" && payload?.details?.quote) {
          setServerQuote(payload.details.quote as ServerQuote);
          setPriceChangedNotice(
            isAR
              ? `تغير السعر إلى ${formatEur(Number(payload.details.new_total ?? 0))}. راجع السعر ثم أرسل مرة أخرى.`
              : `The fare changed to ${formatEur(Number(payload.details.new_total ?? 0))}. Please review it, then submit again.`,
          );
          return;
        }
        if (typeof payload?.code === "string" && payload.code.startsWith("luxride_turnstile")) {
          resetTurnstile();
        }
        const message =
          payload?.code === "last_minute_required"
            ? leadTimeMessage
            : (payload?.message ?? (isAR ? "تعذر إرسال طلب الحجز." : "Could not submit the booking request."));
        setSubmitError(message);
        return;
      }

      const saved = payload?.booking;
      navigate("/booking-success", {
        state: {
          bookingReference: saved?.reference,
          tripLabel,
          tripClassificationLabel: tripClassificationLabel || "",
          route: `${locationLabel(lang, from)} → ${locationLabel(lang, to)}`,
          vehicleName: vehicle.name,
          vehicleCategory: vehicleSegmentLabel(vehicle, lang),
          vehicleImage: vehicle.image,
          departure: `${date} · ${time}`,
          departureDate: date,
          departureTime: time,
          returnDate: needsReturn ? returnDate : "",
          returnTime: needsReturn ? returnTime : "",
          passengers: pax,
          luggage,
          childSeat,
          hotel,
          room,
          flight: isAirportArrival ? flight : "",
          customerName: name,
          customerPhone: phone,
          pricing: saved?.pricing ?? quote.pricing,
          total: formatEur(Number(saved?.final_total_eur ?? quote.pricing.total)),
        },
      });
    } catch {
      setSubmitError(isAR ? "تعذر الاتصال بخادم الحجز." : "Could not reach the booking server.");
    } finally {
      setSubmitLoading(false);
    }
  }

  const hFamily = isAR ? "Cairo, sans-serif" : "'Barlow Condensed', sans-serif";
  const inputCls =
    "w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-gray-800 text-sm focus:border-lux-green focus:outline-none focus:ring-2 focus:ring-lux-green/20 transition-all";
  const labelCls = "mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700";

  const tripTypes: { id: PublicTripType; label: string; desc: string }[] = [
    { id: "oneWay", label: isAR ? "ذهاب فقط" : "One Way", desc: isAR ? "توصيلة واحدة" : "Single transfer" },
    { id: "roundTrip", label: isAR ? "ذهاب وعودة" : "Round Trip", desc: isAR ? "توصيلة ذهاب وعودة" : "Outbound and return transfer" },
  ];

  const stepLabels: Record<Step, string> = {
    1: isAR ? "احسب تكلفة توصيلتك" : "Calculate Your Transfer",
    2: isAR ? "بياناتك" : "Your Details",
    3: isAR ? "المراجعة والإرسال" : "Review & Send",
  };

  return (
    <PageShell
      crumb={isAR ? "الحجز" : "Booking"}
      title={isAR ? "احجز توصيلة" : "Book Your Transfer"}
      subtitle={isAR ? "أسعار ثابتة · بدون رسوم خفية" : "Fixed prices · No hidden fees"}
      tone="brand"
    >
    <div className="min-h-screen bg-gray-50 pb-24">
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
                    style={isAR ? { right: "calc(50% + 1.5rem)", left: "-50%" } : { left: "calc(50% + 1.5rem)", right: "-50%" }}
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
                {isAR ? "احسب تكلفة توصيلتك" : "Calculate Your Transfer"}
              </h2>

              {/* Transfer type */}
              <div className="mb-6">
                <label className={labelCls}>{isAR ? "نوع التوصيلة" : "Transfer Type"}</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tripTypes.map((tt) => (
                    <button
                      type="button"
                      key={tt.id}
                      onClick={() => setPublicTrip(tt.id)}
                      title={tt.desc}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        publicTrip === tt.id ? "border-lux-green bg-lux-green/5 text-lux-green" : "border-gray-200 text-gray-600 hover:border-lux-green/40"
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
                  <LocationSearchInput
                    id="booking-from"
                    lang={lang}
                    label={<><MapPin className="h-4 w-4 text-lux-green" />{isAR ? "موقع الانطلاق" : "Pickup"}</>}
                    value={from}
                    options={pickups}
                    placeholder={isAR ? "ابحث عن موقع الانطلاق" : "Search pickup location"}
                    className={inputCls}
                    onChange={handlePickup}
                    invalid={Boolean(step1Errors.pickup)}
                    describedBy={step1Errors.pickup ? "booking-from-error" : undefined}
                  />
                  {step1Errors.pickup && <p id="booking-from-error" role="alert" className="mt-1 text-sm text-red-600">{step1Errors.pickup}</p>}
                </div>
                <div>
                  <LocationSearchInput
                    id="booking-to"
                    lang={lang}
                    label={<><MapPin className="h-4 w-4 text-lux-green" />{isAR ? "الوجهة" : "Destination"}</>}
                    value={to}
                    options={from ? dests : allLocations}
                    placeholder={isAR ? "ابحث عن الوجهة" : "Search destination"}
                    className={inputCls}
                    onChange={handleDestination}
                    invalid={Boolean(step1Errors.destination)}
                    describedBy={step1Errors.destination ? "booking-to-error" : undefined}
                  />
                  {step1Errors.destination && <p id="booking-to-error" role="alert" className="mt-1 text-sm text-red-600">{step1Errors.destination}</p>}
                </div>
                <div>
                  <label htmlFor="booking-date" className={labelCls}><CalendarDays className="h-4 w-4 text-lux-green" />{isAR ? "تاريخ المغادرة" : "Departure Date"}</label>
                  <input
                    id="booking-date"
                    ref={dateRef}
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setStep1Errors((current) => ({ ...current, date: undefined, leadTime: undefined }));
                    }}
                    className={inputCls}
                    min={todayLocal}
                    aria-invalid={Boolean(step1Errors.date)}
                    aria-describedby={step1Errors.date ? "booking-date-error" : undefined}
                  />
                  {step1Errors.date && <p id="booking-date-error" role="alert" className="mt-1 text-sm text-red-600">{step1Errors.date}</p>}
                </div>
                <div>
                  <label htmlFor="booking-time" className={labelCls}><Clock className="h-4 w-4 text-lux-green" />{isAR ? "وقت الانطلاق" : "Pickup Time"}</label>
                  <input
                    id="booking-time"
                    ref={timeRef}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      setStep1Errors((current) => ({ ...current, time: undefined, leadTime: undefined }));
                    }}
                    className={inputCls}
                    aria-invalid={Boolean(step1Errors.time)}
                    aria-describedby={step1Errors.time ? "booking-time-error" : undefined}
                  />
                  {step1Errors.time && <p id="booking-time-error" role="alert" className="mt-1 text-sm text-red-600">{step1Errors.time}</p>}
                </div>
              </div>

              {/* Vehicle selector */}
              <div className="mt-5">
                <label className={labelCls}>{isAR ? "السيارة" : "Vehicle"}</label>
                <VehicleSegmentedSelector id="booking-vehicle" lang={lang} value={vehicleId} onChange={handleVehicleChange} />
              </div>

              {/* Pax + Luggage */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="booking-passengers" className={labelCls}><Users className="h-4 w-4 text-lux-green" />{isAR ? "ركاب" : "Passengers"}</label>
                  <select id="booking-passengers" value={pax} onChange={(e) => setPax(e.target.value)} className={inputCls}>
                    {Array.from({ length: vehicle.pax }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="booking-luggage" className={labelCls}><Luggage className="h-4 w-4 text-lux-green" />{isAR ? "حقائب" : "Bags"}</label>
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
              {!vehicleSelectable && (
                <p role="alert" className="mt-4 rounded-xl border border-lux-orange/40 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                  {isAR ? "السيارة المحددة غير متاحة للحجز حالياً. اختر سيارة أخرى للمتابعة." : "The selected vehicle is temporarily unavailable for booking. Choose another vehicle to continue."}
                </p>
              )}
              {availabilityError && (
                <p role="alert" className="mt-4 rounded-xl border border-lux-orange/40 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                  {availabilityError}
                </p>
              )}
            </div>

            {/* Price preview */}
            {breakdown && vehicleSelectable && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="text-lux-charcoal mb-4" style={{ fontFamily: hFamily, fontSize: "1.1rem", fontWeight: 700 }}>
                  {isAR ? "معاينة السعر" : "Price Preview"}
                </h3>
                <PriceTable breakdown={breakdown} route={route} isAR={isAR} hFamily={hFamily} preliminaryOvernight={trip === "overnight" && !hasValidReturn} />
              </div>
            )}

            {/* Configured booking cutoff */}
            {tooSoon && (
              <div className="rounded-xl border border-lux-orange/30 bg-orange-50 p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-lux-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-lux-charcoal">
                    {isAR ? "الحجز الفوري غير متاح" : "Standard booking unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {isAR
                      ? `يتطلب الحجز العادي ${leadHoursArabic} على الأقل. تواصل عبر واتساب.`
                      : `Standard booking requires at least ${leadHoursText} before departure. Contact us on WhatsApp to check last-minute availability.`}
                  </p>
                  <a
                    href={settingsWhatsappLink(settings, "Hi LuxRide, I need a last-minute transfer.")}
                    target="_blank" rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-lux-orange px-5 py-2 text-sm text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {isAR ? "تحقق من التوفر" : "Check Availability"}
                  </a>
                </div>
              </div>
            )}
            {step1Errors.leadTime && (
              <p role="alert" className="rounded-xl border border-lux-orange/40 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                {step1Errors.leadTime}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleStep1Next}
                disabled={!step1Valid || tooSoon || availabilityLoading}
                aria-disabled={!step1Valid || tooSoon || availabilityLoading}
                className="flex items-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white font-medium transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: hFamily, fontWeight: 700, fontSize: "1.05rem" }}
              >
                {availabilityLoading ? (isAR ? "جارٍ التحقق..." : "Checking availability...") : (isAR ? "التالي: بياناتك" : "Next: Your Details")}
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
                    {trip === "overday" ? (
                      <Field
                        label={isAR ? "تاريخ العودة" : "Return Date"}
                        labelCls={labelCls}
                        note={isAR ? "هذا المسار يعود في نفس تاريخ المغادرة." : "This route returns on the same date as departure."}
                      >
                        <input type="date" value={date} readOnly className={`${inputCls} bg-gray-50`} aria-readonly="true" />
                      </Field>
                    ) : (
                      <Field
                        label={isAR ? "تاريخ العودة *" : "Return Date *"}
                        labelCls={labelCls}
                        note={isAR ? "هذا المسار يتطلب تاريخ عودة لاحقاً." : "This route requires a later return date."}
                      >
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className={inputCls}
                          min={date ? addDays(date, 1) : todayLocal}
                        />
                      </Field>
                    )}
                    <Field label={isAR ? "وقت العودة *" : "Return Time *"} labelCls={labelCls}>
                      <input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={inputCls} />
                    </Field>
                    {returnTime && !hasValidReturn && (
                      <p role="alert" className="text-sm text-red-600 sm:col-span-2">
                        {isAR
                          ? trip === "overday" ? "يجب أن تكون العودة في اليوم نفسه وبعد المغادرة." : "يجب أن تكون العودة في يوم لاحق."
                          : trip === "overday" ? "Return must be later on the same day." : "Return must be on a later date."}
                      </p>
                    )}
                  </div>
                )}
                <Field label={isAR ? "اسم الفندق أو موقع الوصول بالتحديد *" : "Hotel name or exact destination *"} labelCls={labelCls}>
                  <input type="text" value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder={isAR ? "مثال: اسم الفندق أو العنوان بالتحديد" : "e.g. Hotel name or exact address"} className={inputCls} />
                </Field>
                <Field label={isAR ? "رقم الغرفة (اختياري)" : "Room Number (optional)"} labelCls={labelCls} note={isAR ? "إضافة رقم الغرفة يساعد على تنسيق الاستلام." : "Adding your room number helps us coordinate your pickup."}>
                  <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder={isAR ? "مثال: 214" : "e.g. 214"} className={inputCls} />
                </Field>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-lux-green/20 bg-lux-green/5 px-4 py-3 text-sm text-lux-charcoal">
                  <span>
                    <span className="block font-semibold">{isAR ? "كرسي أطفال مجاني" : "Free Child Seat"}</span>
                    <span className="block text-xs text-gray-500">{isAR ? "اختياري ومجاني لأي حجز." : "Optional and free for any booking."}</span>
                  </span>
                  <input type="checkbox" checked={childSeat} onChange={(event) => setChildSeat(event.target.checked)} className="h-5 w-5 accent-lux-green" />
                </label>
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
                <Field label={isAR ? "البريد الإلكتروني (اختياري)" : "Email Address (optional)"} labelCls={labelCls}>
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
                className="flex items-center gap-2 rounded-full bg-lux-green px-8 py-3.5 text-white font-medium transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <ReviewSection title={isAR ? "تفاصيل التوصيلة" : "Transfer Details"} hFamily={hFamily}>
                <ReviewRow label={isAR ? "نوع التوصيلة" : "Transfer Type"} value={tripLabel} />
                {tripClassificationLabel && <ReviewRow label={isAR ? "تصنيف الرحلة" : "Trip classification"} value={tripClassificationLabel} />}
                <ReviewRow label={isAR ? "مسار" : "Route"} value={`${locationLabel(lang, from)} → ${locationLabel(lang, to)}`} />
                <ReviewRow label={isAR ? "المغادرة" : "Departure"} value={`${date} at ${time}`} />
                {needsReturn && <ReviewRow label={isAR ? "العودة" : "Return"} value={`${returnDate || "-"} at ${returnTime || "-"}`} />}
                <ReviewRow label={isAR ? "السيارة" : "Vehicle"} value={`${vehicle.name} (${vehicleSegmentLabel(vehicle, lang)})`} />
                <ReviewRow label={isAR ? "الركاب" : "Passengers"} value={pax} />
                <ReviewRow label={isAR ? "الحقائب" : "Bags"} value={luggage} />
                <ReviewRow label={isAR ? "كرسي أطفال" : "Child seat"} value={childSeat ? (isAR ? "نعم، مجاني" : "Yes, free") : (isAR ? "لا" : "No")} />
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

              <div className="mt-4 rounded-xl bg-lux-green/5 border border-lux-green/20 p-5">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3" style={{ fontFamily: hFamily }}>
                  {isAR ? "تفصيل السعر" : "Price Breakdown"}
                </h3>
                {quoteLoading && <p className="text-sm text-gray-600">{isAR ? "يتم تحديث السعر من الخادم..." : "Refreshing server price..."}</p>}
                {quoteError && <p role="alert" className="text-sm text-red-600">{quoteError}</p>}
                {!quoteLoading && !quoteError && serverQuote && (
                  <QuotePriceTable quote={serverQuote} isAR={isAR} hFamily={hFamily} />
                )}
                {!quoteLoading && !quoteError && !serverQuote && (
                  <p className="text-sm text-gray-600">{isAR ? "اضغط تحديث السعر قبل الإرسال." : "Refresh the server price before submitting."}</p>
                )}
                <button
                  type="button"
                  onClick={() => void requestQuote(true)}
                  className="mt-4 inline-flex rounded-full border border-lux-green/30 px-4 py-2 text-sm font-semibold text-lux-green transition-all hover:bg-lux-green hover:text-white"
                >
                  {isAR ? "تحديث السعر" : "Refresh Price"}
                </button>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">{isAR ? "سياسة الإلغاء" : "Cancellation Policy"}</p>
                <p>{isAR ? "استرداد كامل عند الإلغاء قبل 24 ساعة على الأقل من وقت بدء التجربة بالتوقيت المحلي. لا استرداد عند الإلغاء قبل أقل من 24 ساعة." : "Full refund when cancelled at least 24 hours before the experience start time in the local timezone. No refund for cancellation less than 24 hours before the start time."}</p>
              </div>
              {turnstile.enabled && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    {isAR ? "فحص أمان سريع لإرسال الحجز" : "Quick booking security check"}
                  </p>
                  <div className="min-w-0 max-w-full overflow-hidden" dir="ltr">
                    <div ref={turnstileRef} className="min-h-[65px] max-w-full overflow-hidden" data-turnstile-mode={turnstile.mode} />
                  </div>
                </div>
              )}
            </div>

            {/* THE ONE SUBMIT BUTTON */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 mb-5">
                {isAR
                  ? "سيتم حفظ طلب الحجز لدى LuxRide ومراجعته قبل التأكيد."
                  : "Your booking request will be saved for LuxRide review before confirmation."}
              </p>
              {priceChangedNotice && <p role="alert" className="mb-4 rounded-xl border border-lux-orange/40 bg-orange-50 px-4 py-3 text-sm text-gray-700">{priceChangedNotice}</p>}
              {submitError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading || quoteLoading || !serverQuote || (turnstile.enabled && !turnstileToken)}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-lux-green px-10 py-4 text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: hFamily, fontWeight: 800, fontSize: "1.15rem" }}
              >
                <Send className="h-5 w-5" />
                {submitLoading ? (isAR ? "جارٍ الإرسال..." : "Submitting...") : (isAR ? "إرسال طلب الحجز" : "Send Booking Request")}
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
    </PageShell>
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
  preliminaryOvernight,
}: {
  breakdown: NonNullable<ReturnType<typeof computePrice>>;
  route: ReturnType<typeof findRoute>;
  isAR: boolean;
  hFamily: string;
  preliminaryOvernight: boolean;
}) {
  const visibleTotal = preliminaryOvernight ? breakdown.total - breakdown.overnight : breakdown.total;
  const discountLabel = route?.promotion
    ? route.promotion.type === "fixed"
      ? route.promotion.name || (isAR ? "عرض خاص" : "Special offer")
      : `${route.promotion.name || (isAR ? "عرض خاص" : "Special offer")} (${Math.round(route.promotion.value)}%)`
    : route?.discountPct
      ? `${isAR ? "خصم" : "Discount"} (${route.discountPct}%)`
      : (isAR ? "خصم" : "Discount");
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>{isAR ? "السعر الأساسي" : "Base price"}</span>
        <span>{formatEur(breakdown.base)}</span>
      </div>
      {breakdown.discount > 0 && (
        <div className="flex justify-between text-lux-orange">
          <span>{discountLabel}</span>
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
      {breakdown.overnight > 0 && preliminaryOvernight && (
        <div className="flex justify-between gap-4 text-gray-600">
          <span>{isAR ? "مبيت السائق" : "Driver accommodation"}</span>
          <span className="text-end">
            {isAR
              ? `${formatEur(breakdown.overnight)} / ليلة — يُحسب بعد تاريخ العودة`
              : `${formatEur(breakdown.overnight)} / night — calculated after return date`}
          </span>
        </div>
      )}
      {breakdown.overnight > 0 && !preliminaryOvernight && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "مبيت السائق" : "Driver accommodation"}</span>
          <span>{formatEur(breakdown.overnight)}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3">
        <span className="font-semibold text-lux-charcoal">
          {preliminaryOvernight
            ? (isAR ? "تقدير التوصيلة قبل تفاصيل العودة" : "Base transfer estimate")
            : (isAR ? "الإجمالي النهائي" : "Final Total")}
        </span>
        <span className="text-lux-green" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
          {formatEur(visibleTotal)}
        </span>
      </div>
      {preliminaryOvernight && (
        <p className="text-xs leading-5 text-gray-500">
          {isAR
            ? "يظهر الإجمالي النهائي بعد إدخال تاريخ ووقت العودة."
            : "Final total is calculated after you enter the return date and time."}
        </p>
      )}
    </div>
  );
}

function nightLabel(nights: number, isAR: boolean): string {
  if (!isAR) return `${nights} ${nights === 1 ? "night" : "nights"}`;
  if (nights === 1) return "ليلة واحدة";
  if (nights === 2) return "ليلتين";
  if (nights >= 3 && nights <= 10) return `${nights} ليالٍ`;
  return `${nights} ليلة`;
}

function QuotePriceTable({ quote, isAR, hFamily }: { quote: ServerQuote; isAR: boolean; hFamily: string }) {
  const pricing = quote.pricing;
  const nights = Number(pricing.accommodation?.nights ?? 0);
  const accommodationPerNight = Number(pricing.accommodation?.price_per_night ?? 0);
  const accommodationFee = Number(pricing.accommodation_fee);
  const promotion = pricing.promotion;
  const hasPromotion = Boolean(promotion?.has_promotion && Number(promotion?.promotion_discount_amount) > 0);
  const promoPercent = Number(promotion?.promotion_discount_percent ?? 0);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>{isAR ? "السعر الأساسي" : "Base price"}</span>
        <span className={hasPromotion ? "text-gray-400 line-through" : ""}>{formatEur(Number(pricing.base))}</span>
      </div>
      {hasPromotion && (
        <div className="flex justify-between gap-4 text-lux-orange">
          <span className="min-w-0">
            <span className="block">{isAR ? "عرض خاص" : "Special offer"}{promoPercent > 0 ? ` · ${Math.round(promoPercent)}% OFF` : ""}</span>
            {promotion?.promotion_name && <span className="block text-xs text-lux-orange/80">{promotion.promotion_name}</span>}
          </span>
          <span>-{formatEur(Number(pricing.discount))}</span>
        </div>
      )}
      {hasPromotion && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "السعر بعد العرض" : "Promotional fare"}</span>
          <span>{formatEur(Number(pricing.promotional_base ?? pricing.base))}</span>
        </div>
      )}
      {Number(pricing.airport_fee) > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "رسوم المطار" : "Airport surcharge"}</span>
          <span>{formatEur(Number(pricing.airport_fee))}</span>
        </div>
      )}
      {Number(pricing.permit_fee) > 0 && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? "تصريح السفر" : "Travel permit"}</span>
          <span>{formatEur(Number(pricing.permit_fee))}</span>
        </div>
      )}
      {accommodationFee > 0 && (
        <div className="flex justify-between gap-4 text-gray-600">
          <span className="min-w-0">
            <span className="block">{isAR ? "مبيت السائق" : "Driver Accommodation"}</span>
            {nights > 0 && accommodationPerNight > 0 && (
              <span className="block text-xs text-gray-500">
                {formatEur(accommodationPerNight)} × {nightLabel(nights, isAR)} = {formatEur(accommodationFee)}
              </span>
            )}
          </span>
          <span className="shrink-0">{formatEur(accommodationFee)}</span>
        </div>
      )}
      {pricing.child_seat?.requested && (
        <div className="flex justify-between text-gray-600">
          <span>{isAR ? pricing.child_seat.label_ar : pricing.child_seat.label}</span>
          <span>{formatEur(Number(pricing.child_seat.price))}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-gray-200 pt-3">
        <span className="font-semibold text-lux-charcoal">{isAR ? "الإجمالي النهائي" : "Final Total"}</span>
        <span className="text-lux-green" style={{ fontFamily: hFamily, fontSize: "1.4rem", fontWeight: 700 }}>
          {formatEur(Number(pricing.total))}
        </span>
      </div>
    </div>
  );
}
