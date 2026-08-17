import {
  TripType,
  PublicTripType,
  VehicleId,
  availablePublicTripTypes,
  availableVehicle,
  clampWholeNumber,
  defaultPublicTrip,
  destinationsFor,
  findRoute,
  isPublicTripType,
  isTripType,
  pickupLocations,
  publicTripFromInternal,
  resolveTripType,
} from "./data";

export interface InitialBookingState {
  trip: TripType;
  publicTrip: PublicTripType;
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleId: VehicleId;
  pax: string;
  luggage: string;
  returnDate: string;
  returnTime: string;
  corrected: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const BOOKING_TIME_ZONE = "Africa/Cairo";

export function readInitialBookingState(params: URLSearchParams): InitialBookingState {
  const pickups = pickupLocations();
  const requestedFrom = params.get("from");
  const from = requestedFrom && pickups.includes(requestedFrom) ? requestedFrom : "";

  const destinations = from ? destinationsFor(from) : [];
  const requestedTo = params.get("to");
  const to = requestedTo && destinations.includes(requestedTo) ? requestedTo : "";
  const route = from && to ? findRoute(from, to) : undefined;

  const requestedTrip = params.get("trip");
  const publicTrips = availablePublicTripTypes(route);
  const fallbackPublicTrip = defaultPublicTrip(route);
  const legacyPublicTrip = isTripType(requestedTrip) ? publicTripFromInternal(route, requestedTrip) : null;
  const publicTrip = isPublicTripType(requestedTrip) && publicTrips.includes(requestedTrip)
    ? requestedTrip
    : legacyPublicTrip ?? fallbackPublicTrip;
  const trip = resolveTripType(route, publicTrip) ?? "oneWay";

  const requestedVehicle = params.get("vehicle");
  const vehicle = availableVehicle(requestedVehicle);
  const pax = clampWholeNumber(params.get("pax"), 1, vehicle.pax);
  const luggage = clampWholeNumber(params.get("luggage"), 0, vehicle.luggage);

  const requestedDate = params.get("date") ?? "";
  const requestedTime = params.get("time") ?? "";
  const date = DATE_PATTERN.test(requestedDate) ? requestedDate : "";
  const time = TIME_PATTERN.test(requestedTime) ? requestedTime : "";
  const requestedReturnDate = params.get("returnDate") ?? "";
  const requestedReturnTime = params.get("returnTime") ?? "";
  const rawReturnDate = DATE_PATTERN.test(requestedReturnDate) ? requestedReturnDate : "";
  const rawReturnTime = TIME_PATTERN.test(requestedReturnTime) ? requestedReturnTime : "";
  const returnFields = normalizeReturnFields(trip, date, rawReturnDate, rawReturnTime);

  const corrected =
    (requestedFrom != null && requestedFrom !== from) ||
    (requestedTo != null && requestedTo !== to) ||
    (requestedTrip != null && requestedTrip !== publicTrip && requestedTrip !== trip) ||
    (requestedVehicle != null && requestedVehicle !== vehicle.id) ||
    (params.get("pax") != null && params.get("pax") !== String(pax)) ||
    (params.get("luggage") != null && params.get("luggage") !== String(luggage)) ||
    (requestedDate !== date) ||
    (requestedTime !== time) ||
    (requestedReturnDate !== returnFields.returnDate) ||
    (requestedReturnTime !== returnFields.returnTime);

  return {
    trip,
    publicTrip,
    from,
    to,
    date,
    time,
    vehicleId: vehicle.id,
    pax: String(pax),
    luggage: String(luggage),
    returnDate: returnFields.returnDate,
    returnTime: returnFields.returnTime,
    corrected,
  };
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function datePartsInTimeZone(value: Date, timeZone: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    hour: Number(byType.hour === "24" ? "0" : byType.hour),
    minute: Number(byType.minute),
  };
}

function zonedDateTimeToUtcMs(date: string, time: string, timeZone: string): number {
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) return NaN;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const zoneParts = datePartsInTimeZone(new Date(utcGuess), timeZone);
  const zoneAsUtc = Date.UTC(zoneParts.year, zoneParts.month - 1, zoneParts.day, zoneParts.hour, zoneParts.minute);
  return utcGuess - (zoneAsUtc - utcGuess);
}

export function todayInBookingTimeZone(now = new Date()): string {
  const parts = datePartsInTimeZone(now, BOOKING_TIME_ZONE);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function isWithinLeadTime(
  departureDate: string,
  departureTime: string,
  leadHours: number,
  now = new Date(),
): boolean {
  const departure = zonedDateTimeToUtcMs(departureDate, departureTime, BOOKING_TIME_ZONE);
  return Number.isFinite(departure) && departure - now.getTime() < leadHours * 3600_000;
}

export function isValidReturn(
  trip: "oneWay" | "overday" | "overnight",
  departureDate: string,
  departureTime: string,
  returnDate: string,
  returnTime: string,
): boolean {
  if (trip === "oneWay") return true;
  if (!departureDate || !departureTime || !returnDate || !returnTime) return false;
  if (trip === "overday" && returnDate !== departureDate) return false;
  if (trip === "overnight" && returnDate <= departureDate) return false;

  const departure = new Date(`${departureDate}T${departureTime}`).getTime();
  const returning = new Date(`${returnDate}T${returnTime}`).getTime();
  return Number.isFinite(departure) && Number.isFinite(returning) && returning > departure;
}

export function addDays(date: string, days: number): string {
  if (!DATE_PATTERN.test(date)) return "";
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().split("T")[0];
}

export function normalizeReturnFields(
  trip: TripType,
  departureDate: string,
  returnDate: string,
  returnTime: string,
): { returnDate: string; returnTime: string } {
  if (trip === "oneWay") return { returnDate: "", returnTime: "" };
  if (trip === "overday") {
    return { returnDate: departureDate || "", returnTime };
  }
  if (!departureDate || !returnDate || returnDate <= departureDate) {
    return { returnDate: "", returnTime };
  }
  return { returnDate, returnTime };
}
