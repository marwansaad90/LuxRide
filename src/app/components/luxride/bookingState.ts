import {
  TripType,
  VehicleId,
  availableTripTypes,
  availableVehicle,
  clampWholeNumber,
  destinationsFor,
  findRoute,
  isTripType,
  pickupLocations,
} from "./data";

export interface InitialBookingState {
  trip: TripType;
  from: string;
  to: string;
  date: string;
  time: string;
  vehicleId: VehicleId;
  pax: string;
  luggage: string;
  corrected: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function readInitialBookingState(params: URLSearchParams): InitialBookingState {
  const pickups = pickupLocations();
  const requestedFrom = params.get("from");
  const from = requestedFrom && pickups.includes(requestedFrom) ? requestedFrom : pickups[0];

  const destinations = destinationsFor(from);
  const requestedTo = params.get("to");
  const to = requestedTo && destinations.includes(requestedTo) ? requestedTo : destinations[0];
  const route = findRoute(from, to);

  const requestedTrip = params.get("trip");
  const trips = availableTripTypes(route);
  const trip = isTripType(requestedTrip) && trips.includes(requestedTrip)
    ? requestedTrip
    : (trips[0] ?? "oneWay");

  const requestedVehicle = params.get("vehicle");
  const vehicle = availableVehicle(requestedVehicle);
  const pax = clampWholeNumber(params.get("pax"), 1, vehicle.pax);
  const luggage = clampWholeNumber(params.get("luggage"), 0, vehicle.luggage);

  const requestedDate = params.get("date") ?? "";
  const requestedTime = params.get("time") ?? "";
  const date = DATE_PATTERN.test(requestedDate) ? requestedDate : "";
  const time = TIME_PATTERN.test(requestedTime) ? requestedTime : "";

  const corrected =
    (requestedFrom != null && requestedFrom !== from) ||
    (requestedTo != null && requestedTo !== to) ||
    (requestedTrip != null && requestedTrip !== trip) ||
    (requestedVehicle != null && requestedVehicle !== vehicle.id) ||
    (params.get("pax") != null && params.get("pax") !== String(pax)) ||
    (params.get("luggage") != null && params.get("luggage") !== String(luggage)) ||
    (requestedDate !== date) ||
    (requestedTime !== time);

  return {
    trip,
    from,
    to,
    date,
    time,
    vehicleId: vehicle.id,
    pax: String(pax),
    luggage: String(luggage),
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
