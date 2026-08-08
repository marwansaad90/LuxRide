// LuxRide shared data — images, routes, pricing, fleet, and fees
// All prices in EUR, tax inclusive, fixed per the approved price table.

import xpanderImg from "../../../assets/vehicles/xpander.webp";
import corollaImg from "../../../assets/vehicles/corolla.webp";
import hiacaImg from "../../../assets/vehicles/hiace.webp";
import { WORKBOOK_PRICE_LIST_META, WORKBOOK_PRICE_LIST_ROWS, type WorkbookDraftStatus, type WorkbookRouteRow } from "./workbookRoutes";

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
  villageRoad:
    "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  alAhyaa:
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  elGouna:
    "https://images.unsplash.com/photo-1601816500593-8f1276479ea6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  makadi:
    "https://images.unsplash.com/photo-1755545760275-abd2f1b8ed2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  soma:
    "https://images.unsplash.com/photo-1755545745583-334a6398c61b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  luxor:
    "https://images.unsplash.com/photo-1629468855534-450d7c4c5f72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  aswan:
    "https://images.unsplash.com/photo-1738580426867-03fa8c8b5288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  cairo:
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  alexandria:
    "https://images.unsplash.com/photo-1682090500311-9e57a5a57390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  sharm:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Naama_Bay_Beach_R01.jpg?width=1080",
  wadiElGemal:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
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
export const EMAIL = "booking@luxride-eg.com";

export { TRIPADVISOR_PAGE_URL as TRIPADVISOR_URL } from "./tripadvisor";
export const FACEBOOK_URL = "https://www.facebook.com/luxride.eg/";
export const INSTAGRAM_URL = "https://www.instagram.com/luxride.eg/";

// ─── Fees & rules ─────────────────────────────────────────────────────────────
export const AIRPORT_SURCHARGE = 2; // €, once per booking on Hurghada Airport routes
export const DRIVER_OVERNIGHT = 33; // €, only when a route explicitly requires it
export const PERMIT_FEE = { sedan: 20, mpv: 20, minivan: 30 } as const; // € once per booking
export const PERMIT_DESTINATIONS = ["Luxor", "Aswan", "Cairo", "Sharm El Sheikh"];
export const MAX_AIRPORT_WAIT_HOURS = 3;
export const BOOKING_CUTOFF_HOURS = 3; // standard booking must be ≥ 3h before departure
export const CLIENT_REVIEW_ENABLE_ALL_VEHICLES = true;

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
export const PRODUCTION_ACTIVE_FLEET = FLEET.filter((v) => v.available);
export const VEHICLE_SEGMENT_ORDER: VehicleId[] = ["corolla", "xpander", "hiace"];
export const SELECTABLE_FLEET = VEHICLE_SEGMENT_ORDER
  .map((id) => FLEET.find((vehicle) => vehicle.id === id))
  .filter((vehicle): vehicle is Vehicle => Boolean(vehicle))
  .filter((vehicle) => CLIENT_REVIEW_ENABLE_ALL_VEHICLES || vehicle.available);

// ─── Transfer types ───────────────────────────────────────────────────────────────
export type PublicTripType = "oneWay" | "roundTrip";
export type TripType = "oneWay" | "overday" | "overnight";
export type RoundTripMode = Exclude<TripType, "oneWay">;

// ─── Routes & fixed price table (EUR) ────────────────────────────────────────
export interface Route {
  id: string;
  from: string;
  to: string;
  prices: Partial<Record<TripType, number>>;
  mpvOneWay?: number;
  sourceRow?: number;
  draftStatus?: WorkbookDraftStatus;
  fromAr?: string;
  toAr?: string;
  outboundClassification?: string;
  returnClassification?: string;
  returnClassificationAr?: string;
  duration: string;
  image?: string;
  airport?: boolean; // Hurghada Airport arrival/departure → €2 surcharge
  permit?: boolean; // out-of-city permit destination
  discountPct?: number; // route-specific promotional discount
  accommodationRequired?: boolean; // only set after client confirms the route rule
}

export interface RouteTripRule {
  oneWayPrice?: number;
  roundTripMode?: RoundTripMode;
  roundTripPrice?: number;
}

const OVERNIGHT_RETURN_DESTINATIONS = new Set(["Aswan", "Alexandria", "Sharm El Sheikh"]);
const CONFIRMED_WORKBOOK_ROWS = WORKBOOK_PRICE_LIST_ROWS.filter((row) => !row.yellowColumns.some((column) => column <= 10));
export const DRAFT_ROUTE_REFERENCES = WORKBOOK_PRICE_LIST_ROWS.filter((row) => row.draftStatus === "provisional");
export { WORKBOOK_PRICE_LIST_META };

function workbookReturnMode(row: WorkbookRouteRow): RoundTripMode {
  const returnName = row.returnTripName.toLowerCase();
  if (returnName.includes("overnight") || OVERNIGHT_RETURN_DESTINATIONS.has(row.destination)) return "overnight";
  return "overday";
}

function routeDuration(row: WorkbookRouteRow): string {
  if (row.pickup === "Hurghada Airport" && row.destination === "Hurghada") return "20 min";
  if ([row.pickup, row.destination].includes("Luxor")) return "4 h";
  if ([row.pickup, row.destination].includes("Cairo")) return "5 h 30 min";
  if ([row.pickup, row.destination].includes("Aswan")) return "7 h";
  if ([row.pickup, row.destination].includes("Alexandria")) return "8 h";
  if ([row.pickup, row.destination].includes("Sharm El Sheikh")) return "6 h";
  if ([row.pickup, row.destination].includes("Marsa Alam")) return "3 h";
  if ([row.pickup, row.destination].includes("Wadi El Gemal")) return "4 h";
  if ([row.pickup, row.destination].includes("Hamata")) return "4 h";
  if ([row.pickup, row.destination].includes("Marsa Ghaleb")) return "2 h 30 min";
  if ([row.pickup, row.destination].includes("El Quseir")) return "2 h";
  if ([row.pickup, row.destination].includes("Safaga")) return "1 h";
  if ([row.pickup, row.destination].includes("Soma Bay")) return "50 min";
  if ([row.pickup, row.destination].includes("Makadi Bay")) return "40 min";
  if ([row.pickup, row.destination].includes("El Gouna")) return "35 min";
  if ([row.pickup, row.destination].includes("Sahl Hasheesh")) return "30 min";
  return "on request";
}

function routeImage(row: WorkbookRouteRow): string {
  const key = `${row.pickup} ${row.destination}`;
  if (key.includes("Luxor")) return IMAGES.luxor;
  if (key.includes("Aswan")) return IMAGES.aswan;
  if (key.includes("Cairo") || key.includes("Zaafarana")) return IMAGES.cairo;
  if (key.includes("Alexandria")) return IMAGES.alexandria;
  if (key.includes("Sharm El Sheikh")) return IMAGES.sharm;
  if (key.includes("Wadi El Gemal") || key.includes("Sharm El Luli") || key.includes("El Qulaan") || key.includes("Abu Dabbab")) return IMAGES.wadiElGemal;
  if (key.includes("Marsa Alam") || key.includes("Marsa Ghaleb") || key.includes("Hamata") || key.includes("El Quseir")) return IMAGES.marsaAlam;
  if (key.includes("El Gouna")) return IMAGES.elGouna;
  if (key.includes("Makadi")) return IMAGES.makadi;
  if (key.includes("Soma Bay") || key.includes("Safaga")) return IMAGES.soma;
  if (key.includes("Village Road")) return IMAGES.villageRoad;
  if (key.includes("Al Ahyaa")) return IMAGES.alAhyaa;
  return IMAGES.hurghada;
}

export function workbookOneWayPrice(mpvOneWay: number, vehicle: Vehicle): number {
  if (vehicle.permitTier === "sedan") return Math.round(mpvOneWay * WORKBOOK_PRICE_LIST_META.sedanRatio);
  if (vehicle.permitTier === "minivan") return Math.round(mpvOneWay * WORKBOOK_PRICE_LIST_META.miniVanRatio);
  return Math.round(mpvOneWay);
}

export function workbookRoundTripPrice(mpvOneWay: number, vehicle: Vehicle): number {
  return Math.round(workbookOneWayPrice(mpvOneWay, vehicle) * WORKBOOK_PRICE_LIST_META.roundTripRatio);
}

function routeFromWorkbook(row: WorkbookRouteRow): Route {
  const roundTripMode = workbookReturnMode(row);
  const mpvRoundTrip = workbookRoundTripPrice(row.mpvOneWay, FLEET.find((vehicle) => vehicle.id === "xpander")!);
  return {
    id: row.id,
    sourceRow: row.sourceRow,
    from: row.pickup,
    to: row.destination,
    fromAr: row.pickupAr,
    toAr: row.destinationAr,
    mpvOneWay: row.mpvOneWay,
    prices: { oneWay: row.mpvOneWay, [roundTripMode]: mpvRoundTrip },
    duration: routeDuration(row),
    image: routeImage(row),
    airport: row.pickup === "Hurghada Airport",
    permit: PERMIT_DESTINATIONS.includes(row.pickup) || PERMIT_DESTINATIONS.includes(row.destination),
    outboundClassification: row.outboundTripName,
    returnClassification: row.returnTripName,
    returnClassificationAr: row.returnTripNameAr,
    draftStatus: row.draftStatus,
  };
}

export const ROUTES: Route[] = CONFIRMED_WORKBOOK_ROWS.map(routeFromWorkbook);

export function tripRulesFor(route: Route | undefined): RouteTripRule | null {
  if (!route) return null;
  const roundTripMode: RoundTripMode | undefined =
    route.prices.overday != null ? "overday" : route.prices.overnight != null ? "overnight" : undefined;
  return {
    oneWayPrice: route.prices.oneWay,
    roundTripMode,
    roundTripPrice: roundTripMode ? route.prices[roundTripMode] : undefined,
  };
}

export const ROUTE_TRIP_RULES: Record<string, RouteTripRule> = Object.fromEntries(
  ROUTES.map((route) => [route.id, tripRulesFor(route)!]),
);

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
  if (route.prices[trip] == null) return null;
  const mpvOneWay = route.mpvOneWay ?? route.prices.oneWay ?? route.prices[trip];
  if (mpvOneWay == null) return null;
  const base = trip === "oneWay"
    ? workbookOneWayPrice(mpvOneWay, vehicle)
    : workbookRoundTripPrice(mpvOneWay, vehicle);
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
export const PUBLIC_TRIP_TYPES: PublicTripType[] = ["oneWay", "roundTrip"];

export function availableTripTypes(route: Route | undefined): TripType[] {
  if (!route) return [];
  return TRIP_TYPES.filter((trip) => route.prices[trip] != null);
}

export function availablePublicTripTypes(route: Route | undefined): PublicTripType[] {
  const rules = tripRulesFor(route);
  if (!rules) return [];
  return [
    ...(rules.oneWayPrice != null ? (["oneWay"] as const) : []),
    ...(rules.roundTripMode && rules.roundTripPrice != null ? (["roundTrip"] as const) : []),
  ];
}

export function isTripType(value: string | null): value is TripType {
  return value != null && TRIP_TYPES.includes(value as TripType);
}

export function isPublicTripType(value: string | null): value is PublicTripType {
  return value != null && PUBLIC_TRIP_TYPES.includes(value as PublicTripType);
}

export function resolveTripType(route: Route | undefined, publicTrip: PublicTripType): TripType | null {
  const rules = tripRulesFor(route);
  if (!rules) return null;
  if (publicTrip === "oneWay") return rules.oneWayPrice != null ? "oneWay" : null;
  return rules.roundTripMode && rules.roundTripPrice != null ? rules.roundTripMode : null;
}

export function publicTripFromInternal(route: Route | undefined, trip: TripType | null): PublicTripType | null {
  if (!route || !trip) return null;
  if (trip === "oneWay") return route.prices.oneWay != null ? "oneWay" : null;
  const rules = tripRulesFor(route);
  return rules?.roundTripMode === trip && rules.roundTripPrice != null ? "roundTrip" : null;
}

export function defaultPublicTrip(route: Route | undefined): PublicTripType {
  return availablePublicTripTypes(route)[0] ?? "oneWay";
}

export function isVehicleSelectable(vehicle: Vehicle): boolean {
  return CLIENT_REVIEW_ENABLE_ALL_VEHICLES || vehicle.available;
}

export function availableVehicle(value: string | null): Vehicle {
  return SELECTABLE_FLEET.find((vehicle) => vehicle.id === value) ?? SELECTABLE_FLEET[0] ?? ACTIVE_FLEET[0];
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

function popularTransfer(
  id: string,
  from: string,
  to: string,
  image: string,
): PopularTransfer {
  const route = findRoute(from, to);
  return {
    id,
    from,
    to,
    image,
    duration: route?.duration ?? "on request",
    fromPrice: route?.prices.oneWay ?? route?.mpvOneWay ?? 0,
    airport: route?.airport,
    permit: route?.permit,
  };
}

export const POPULAR_TRANSFERS: PopularTransfer[] = [
  popularTransfer("airport-hurghada", "Hurghada Airport", "Hurghada", IMAGES.hurghada),
  popularTransfer("airport-makadi", "Hurghada Airport", "Makadi Bay", IMAGES.makadi),
  popularTransfer("airport-gouna", "Hurghada Airport", "El Gouna", IMAGES.elGouna),
  popularTransfer("airport-sahl", "Hurghada Airport", "Sahl Hasheesh", IMAGES.hurghada),
  popularTransfer("airport-village", "Hurghada Airport", "Village Road", IMAGES.villageRoad),
  popularTransfer("airport-ahyaa", "Hurghada Airport", "Al Ahyaa", IMAGES.alAhyaa),
  popularTransfer("hurghada-luxor", "Hurghada", "Luxor", IMAGES.luxor),
  popularTransfer("hurghada-cairo", "Hurghada", "Cairo", IMAGES.cairo),
  popularTransfer("hurghada-marsa-alam", "Hurghada", "Marsa Alam", IMAGES.marsaAlam),
  popularTransfer("hurghada-wadi-el-gemal", "Hurghada", "Wadi El Gemal", IMAGES.wadiElGemal),
];

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  if (!EMAIL) return "#";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
