// LuxRide shared data — images, routes, pricing, fleet, reviews, fees
// All prices in EUR, tax inclusive, fixed per the approved price table.

import xpanderImg from "../../../imports/LuxRide-02.png";
import corollaImg from "../../../imports/LuxRide-01.png";
import hiacaImg from "../../../imports/LuxRide-03.png";

export const VEHICLE_IMAGES = {
  xpander: xpanderImg,
  corolla: corollaImg,
  hiace: hiacaImg,
} as const;

export const IMAGES = {
  heroCar:
    "https://images.unsplash.com/photo-1564890379653-0eb3a6b4eaad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
  driver:
    "https://images.unsplash.com/photo-1627285886624-5cd637dafb50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  hurghada:
    "https://images.unsplash.com/photo-1755545414327-36524febb5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  elGouna:
    "https://images.unsplash.com/photo-1601816500593-8f1276479ea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  makadi:
    "https://images.unsplash.com/photo-1755545760275-abd2f1b8ed2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  soma:
    "https://images.unsplash.com/photo-1755545745583-334a6398c61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  luxor:
    "https://images.unsplash.com/photo-1629468855534-450d7c4c5f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  marsaAlam:
    "https://images.unsplash.com/photo-1630328639261-4c9e94108671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  sedan:
    "https://images.unsplash.com/photo-1618232796173-b7520d9b5941?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  mpv:
    "https://images.unsplash.com/photo-1607588330193-d0fb508bba95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  minivan:
    "https://images.unsplash.com/photo-1770749431157-f1f4b74945fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
} as const;

// ─── Contact (real business details) ─────────────────────────────────────────
export const WHATSAPP_NUMBER = "201013554009"; // +20 101 355 4009
export const PHONE_DISPLAY = "+20 101 355 4009";
export const EMAIL: string | null = null;

export const TRIPADVISOR_URL =
  "https://www.tripadvisor.com/Attraction_Review-g297549-d34457256";
export const INSTAGRAM_URL: string | null = null;
export const FACEBOOK_URL: string | null = null;

// ─── Fees & rules ─────────────────────────────────────────────────────────────
export const AIRPORT_SURCHARGE = 2; // €, once per booking on Hurghada Airport routes
export const DRIVER_OVERNIGHT = 33; // €, only when a route explicitly requires it
export const PERMIT_FEE = { sedan: 20, mpv: 20, minivan: 30 } as const; // € once per booking
export const PERMIT_DESTINATIONS = ["Luxor", "Aswan", "Cairo", "Sharm El Sheikh"];
export const MAX_AIRPORT_WAIT_HOURS = 3;
export const BOOKING_CUTOFF_HOURS = 3; // standard booking must be ≥ 3h before departure

// ─── Fleet ────────────────────────────────────────────────────────────────────
export type PermitTier = "sedan" | "mpv" | "minivan";
export type VehicleId = "xpander" | "corolla" | "hiace";

export interface Vehicle {
  id: VehicleId;
  name: string;
  category: "Sedan" | "MPV" | "Minivan";
  categoryAr: "سيدان" | "MPV" | "ميني فان";
  image: string;
  pax: number;
  luggage: number;
  capacityEn: string;
  capacityAr: string;
  permitTier: PermitTier;
  available: boolean;
  wifi: boolean;
  tagline: string;
}

export const FLEET: Vehicle[] = [
  {
    id: "xpander",
    name: "Mitsubishi Xpander 2027",
    category: "MPV",
    categoryAr: "MPV",
    image: VEHICLE_IMAGES.xpander,
    pax: 4,
    luggage: 4,
    capacityEn: "Up to 4 passengers and 4 bags",
    capacityAr: "حتى 4 ركاب و4 حقائب",
    permitTier: "mpv",
    available: true,
    wifi: true,
    tagline: "Spacious, air-conditioned MPV — ideal for families and small groups",
  },
  {
    id: "corolla",
    name: "Toyota Corolla 2027",
    category: "Sedan",
    categoryAr: "سيدان",
    image: VEHICLE_IMAGES.corolla,
    pax: 3,
    luggage: 2,
    capacityEn: "Up to 3 passengers and 2 bags",
    capacityAr: "حتى 3 ركاب وحقيبتين",
    permitTier: "sedan",
    available: false,
    wifi: true,
    tagline: "Comfortable executive sedan for couples and solo travellers",
  },
  {
    id: "hiace",
    name: "Toyota HiAce 2027",
    category: "Minivan",
    categoryAr: "ميني فان",
    image: VEHICLE_IMAGES.hiace,
    pax: 8,
    luggage: 8,
    capacityEn: "Up to 8 passengers and 8 bags",
    capacityAr: "حتى 8 ركاب و8 حقائب",
    permitTier: "minivan",
    available: false,
    wifi: true,
    tagline: "Roomy minivan for larger groups and extra luggage",
  },
];

export const ACTIVE_FLEET = FLEET.filter((v) => v.available);

// ─── Trip types ───────────────────────────────────────────────────────────────
export type TripType = "oneWay" | "overday" | "overnight";

// ─── Routes & fixed price table (EUR) ────────────────────────────────────────
export interface Route {
  id: string;
  from: string;
  to: string;
  prices: Partial<Record<TripType, number>>;
  duration: string;
  image?: string;
  airport?: boolean; // Hurghada Airport arrival/departure → €2 surcharge
  permit?: boolean; // out-of-city permit destination
  discountPct?: number; // route-specific promotional discount
  accommodationRequired?: boolean; // only set after client confirms the route rule
}

export const ROUTES: Route[] = [
  // Hurghada Airport transfers
  { id: "a1", from: "Hurghada Airport", to: "Hurghada", prices: { oneWay: 10 }, duration: "20 min", image: IMAGES.hurghada, airport: true },
  { id: "a2", from: "Hurghada Airport", to: "El Gouna", prices: { oneWay: 13 }, duration: "35 min", image: IMAGES.elGouna, airport: true },
  { id: "a3", from: "Hurghada Airport", to: "Sahl Hasheesh", prices: { oneWay: 13 }, duration: "30 min", image: IMAGES.hurghada, airport: true },
  { id: "a4", from: "Hurghada Airport", to: "Soma Bay", prices: { oneWay: 13 }, duration: "50 min", image: IMAGES.soma, airport: true },
  { id: "a5", from: "Hurghada Airport", to: "Makadi Bay", prices: { oneWay: 14 }, duration: "40 min", image: IMAGES.makadi, airport: true },
  { id: "a6", from: "Hurghada Airport", to: "Safaga", prices: { oneWay: 18 }, duration: "1 h", image: IMAGES.soma, airport: true },
  { id: "a7", from: "Hurghada Airport", to: "Nefertari", prices: { oneWay: 28 }, duration: "1 h 20 min", image: IMAGES.marsaAlam, airport: true },
  { id: "a8", from: "Hurghada Airport", to: "El Quseir", prices: { oneWay: 38 }, duration: "2 h", image: IMAGES.marsaAlam, airport: true },
  { id: "a9", from: "Hurghada Airport", to: "Marsa Ghaleb", prices: { oneWay: 58 }, duration: "2 h 30 min", image: IMAGES.marsaAlam, airport: true },
  { id: "a10", from: "Hurghada Airport", to: "Marsa Alam", prices: { oneWay: 65 }, duration: "3 h", image: IMAGES.marsaAlam, airport: true },
  { id: "a11", from: "Hurghada Airport", to: "Hamata", prices: { oneWay: 90 }, duration: "4 h", image: IMAGES.marsaAlam, airport: true },

  // City tours (Alf Leila)
  { id: "c1", from: "Hurghada", to: "City Tour – Alf Leila", prices: { oneWay: 22 }, duration: "half day", image: IMAGES.hurghada },
  { id: "c2", from: "El Gouna", to: "City Tour – Alf Leila", prices: { oneWay: 27 }, duration: "half day", image: IMAGES.elGouna },
  { id: "c3", from: "Sahl Hasheesh", to: "City Tour – Alf Leila", prices: { oneWay: 27 }, duration: "half day", image: IMAGES.hurghada },
  { id: "c4", from: "Makadi Bay", to: "City Tour – Alf Leila", prices: { oneWay: 28 }, duration: "half day", image: IMAGES.makadi },
  { id: "c5", from: "Soma Bay", to: "City Tour – Alf Leila", prices: { oneWay: 35 }, duration: "half day", image: IMAGES.soma },
  { id: "c5b", from: "Safaga", to: "City Tour – Alf Leila", prices: { oneWay: 35 }, duration: "half day", image: IMAGES.soma },
  { id: "c6", from: "Hurghada", to: "Sharm El Naga", prices: { oneWay: 35 }, duration: "half day", image: IMAGES.soma },

  // Long-distance & historical (permit required)
  { id: "l1", from: "Hurghada", to: "Luxor", prices: { oneWay: 75, overday: 90 }, duration: "4 h", image: IMAGES.luxor, permit: true, discountPct: 15 },
  { id: "l2", from: "El Gouna", to: "Luxor", prices: { oneWay: 85, overday: 100 }, duration: "4 h 30 min", image: IMAGES.luxor, permit: true },
  { id: "l3", from: "Hurghada", to: "Aswan", prices: { oneWay: 110 }, duration: "7 h", image: IMAGES.luxor, permit: true },
  { id: "l4", from: "Hurghada", to: "Cairo", prices: { oneWay: 110, overday: 120 }, duration: "5 h 30 min", image: IMAGES.luxor, permit: true },
  { id: "l5", from: "Makadi Bay", to: "Cairo", prices: { overday: 135 }, duration: "6 h", image: IMAGES.luxor, permit: true },
  { id: "l5b", from: "Safaga", to: "Cairo", prices: { overday: 135 }, duration: "6 h 30 min", image: IMAGES.luxor, permit: true },
  { id: "l6", from: "Hurghada", to: "Zaafarana", prices: { overday: 90 }, duration: "3 h", image: IMAGES.hurghada },
  { id: "l7", from: "Hurghada", to: "Alexandria", prices: { overnight: 180 }, duration: "8 h", image: IMAGES.luxor },
  { id: "l8", from: "Hurghada", to: "Sharm El Sheikh", prices: { oneWay: 200, overnight: 250 }, duration: "6 h (via ferry/road)", image: IMAGES.soma, permit: true },
];

export function pickupLocations(): string[] {
  return Array.from(new Set(ROUTES.map((r) => r.from)));
}

export function destinationsFor(from: string): string[] {
  return ROUTES.filter((r) => r.from === from).map((r) => r.to);
}

export function findRoute(from: string, to: string): Route | undefined {
  return ROUTES.find((r) => r.from === from && r.to === to);
}

export interface PriceBreakdown {
  base: number;
  discount: number;
  subtotal: number;
  airport: number;
  permit: number;
  overnight: number;
  total: number;
}

export function computePrice(
  route: Route,
  trip: TripType,
  vehicle: Vehicle,
): PriceBreakdown | null {
  const base = route.prices[trip] ?? null;
  if (base == null) return null;
  const discount = route.discountPct
    ? Math.round(base * route.discountPct) / 100
    : 0;
  const subtotal = base - discount;
  const airport = route.airport ? AIRPORT_SURCHARGE : 0;
  const permit = route.permit ? PERMIT_FEE[vehicle.permitTier] : 0;
  const overnight = trip === "overnight" && route.accommodationRequired ? DRIVER_OVERNIGHT : 0;
  return { base, discount, subtotal, airport, permit, overnight, total: subtotal + airport + permit + overnight };
}

export const TRIP_TYPES: TripType[] = ["oneWay", "overday", "overnight"];

export function availableTripTypes(route: Route | undefined): TripType[] {
  if (!route) return [];
  return TRIP_TYPES.filter((trip) => route.prices[trip] != null);
}

export function isTripType(value: string | null): value is TripType {
  return value != null && TRIP_TYPES.includes(value as TripType);
}

export function availableVehicle(value: string | null): Vehicle {
  return FLEET.find((vehicle) => vehicle.id === value && vehicle.available) ?? ACTIVE_FLEET[0];
}

export function clampWholeNumber(value: string | null, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

// ─── Popular transfers (homepage cards) ──────────────────────────────────────
export interface PopularTransfer {
  id: string;
  from: string;
  to: string;
  image: string;
  duration: string;
  fromPrice: number;
  oldPrice?: number;
  discountPct?: number;
  airport?: boolean;
  permit?: boolean;
}

export const POPULAR_TRANSFERS: PopularTransfer[] = [
  { id: "p1", from: "Hurghada Airport", to: "El Gouna", image: IMAGES.elGouna, duration: "35 min", fromPrice: 13, airport: true },
  { id: "p2", from: "Hurghada Airport", to: "Makadi Bay", image: IMAGES.makadi, duration: "40 min", fromPrice: 14, airport: true },
  { id: "p3", from: "Hurghada Airport", to: "Marsa Alam", image: IMAGES.marsaAlam, duration: "3 h", fromPrice: 65, airport: true },
  { id: "p4", from: "Hurghada", to: "Luxor", image: IMAGES.luxor, duration: "4 h", fromPrice: 63.75, oldPrice: 75, discountPct: 15, permit: true },
  { id: "p5", from: "Hurghada", to: "Cairo", image: IMAGES.luxor, duration: "5 h 30 min", fromPrice: 110, permit: true },
  { id: "p6", from: "Hurghada", to: "Sharm El Sheikh", image: IMAGES.soma, duration: "6 h", fromPrice: 200, permit: true },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: string;
  trip: string;
}

export const REVIEWS: Review[] = [
  { id: "r1", name: "Tripadvisor review", country: "Client content required", rating: 0, trip: "Airport transfer", text: "Verified Tripadvisor review content will appear here after the client supplies or approves it." },
  { id: "r2", name: "Tripadvisor review", country: "Client content required", rating: 0, trip: "Red Sea transfer", text: "This visual placeholder does not represent a real customer or published review." },
  { id: "r3", name: "Tripadvisor review", country: "Client content required", rating: 0, trip: "Long-distance trip", text: "Average rating, review count, and approved review excerpts are still required." },
];

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  if (!EMAIL) return "#";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
