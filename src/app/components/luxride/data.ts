// LuxRide shared data — images, routes, pricing, fleet, and fees
// All prices in EUR, tax inclusive, fixed per the approved price table.

import xpanderImg from "../../../assets/vehicles/xpander.webp";
import corollaImg from "../../../assets/vehicles/corolla.webp";
import hiacaImg from "../../../assets/vehicles/hiace.webp";
import aboutTransferImg from "../../../assets/about/luxride-about-transfer.webp";
import airportImg from "../../../assets/destinations/hurghada-airport-transfer.webp";
import cityAirportTransferImg from "../../../assets/destinations/hurghada-city-airport-transfer.webp";
import hurghadaImg from "../../../assets/destinations/hurghada-client.jpg";
import sahlHasheeshImg from "../../../assets/destinations/sahl-hasheesh-client.jpg";
import villageRoadImg from "../../../assets/destinations/village-road-transfer.webp";
import cairoPyramidsImg from "../../../assets/destinations/cairo-pyramids-transfer.webp";
import marsaAlamImg from "../../../assets/destinations/marsa-alam-transfer.webp";
import marsaAlamBeachImg from "../../../assets/destinations/marsa-alam-beach-transfer.webp";
import luxorImg from "../../../assets/destinations/luxor-private-transfer.webp";
import luxorStatueImg from "../../../assets/destinations/luxor-statue-transfer.webp";
import elGounaImg from "../../../assets/destinations/el-gouna-transfer.webp";
import makadiBayImg from "../../../assets/destinations/makadi-bay-transfer.webp";
import aswanImg from "../../../assets/destinations/aswan-private-transfer.webp";
import somaBayImg from "../../../assets/destinations/soma-bay-transfer.webp";
import wadiElGemalImg from "../../../assets/destinations/wadi-el-gemal-transfer.webp";
import { WORKBOOK_PRICE_LIST_META, WORKBOOK_PRICE_LIST_ROWS, type WorkbookDraftStatus, type WorkbookRouteRow } from "./workbookRoutes";

export const VEHICLE_IMAGES = {
  xpander: xpanderImg,
  corolla: corollaImg,
  hiace: hiacaImg,
} as const;

export const IMAGES = {
  aboutTransfer: aboutTransferImg,
  airport: airportImg,
  cityAirportTransfer: cityAirportTransferImg,
  heroCar:
    "https://images.unsplash.com/photo-1564890379653-0eb3a6b4eaad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
  driver:
    "https://images.unsplash.com/photo-1627285886624-5cd637dafb50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
  hurghada: hurghadaImg,
  sahlHasheesh: sahlHasheeshImg,
  villageRoad: villageRoadImg,
  alAhyaa:
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  elGouna: elGounaImg,
  makadi: makadiBayImg,
  soma: somaBayImg,
  luxor: luxorImg,
  luxorDetail: luxorStatueImg,
  aswan: aswanImg,
  cairo: cairoPyramidsImg,
  alexandria:
    "https://images.unsplash.com/photo-1682090500311-9e57a5a57390?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  sharm:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Sharm_El_Sheikh._Naama_Bay..jpg/1280px-Sharm_El_Sheikh._Naama_Bay..jpg",
  wadiElGemal: wadiElGemalImg,
  marsaAlam: marsaAlamImg,
  marsaAlamBeach: marsaAlamBeachImg,
  sedan:
    "https://images.unsplash.com/photo-1618232796173-b7520d9b5941?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  mpv:
    "https://images.unsplash.com/photo-1607588330193-d0fb508bba95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  minivan:
    "https://images.unsplash.com/photo-1770749431157-f1f4b74945fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
} as const;

export const ABOUT_IMAGE_SOURCE_FILE = "LuxRide.gif" as const;

export const DESTINATION_IMAGE_SOURCE_FILES = {
  airport: "images.jpg",
  hurghadaCityAirportTransfer: "Airport.jpg",
  hurghada: "Hurghada.jpg",
  sahlHasheesh: "Sahl-Hasheesh.jpg",
  makadi: "Makadi-Bay.jpg",
  villageRoad: "Village-Road (1).jpg",
  elGouna: "Elguna.jpg",
  soma: "Soma-Bay.jpg",
  marsaAlam: "Marsa-Allam.jpg",
  marsaAlamSecondary: "Marsa-Allam2.jpg",
  cairo: "Pyramids.jpg",
  aswan: "Aswan2.jpg",
  luxor: "Luxor.jpg",
  luxorSecondary: "Luxor2.jpg",
  sharm: "Wikimedia Commons: Sharm_El_Sheikh._Naama_Bay..jpg",
  wadiElGemal: "Wadi-Elgemal.jpg",
} as const;

export const SUPERSEDED_SOURCE_IMAGE_FILES = [
  "04-Robin-Utrecht-1.jpg",
  "507879331.jpg",
  "images-1.jpg",
  "images-2.jpg",
  "pic-panorama-bungalows-resort-el-gouna-hurghada-55.jpg",
  "LuxRide.jpg",
  "Village-Road.jpg",
] as const;

// ─── Contact (real business details) ─────────────────────────────────────────
export const WHATSAPP_NUMBER = "201013554009"; // +20 101 355 4009
export const PHONE_DISPLAY = "+20 101 355 4009";
export const EMAIL = "booking@luxride-eg.com";

export { TRIPADVISOR_PAGE_URL as TRIPADVISOR_URL } from "./tripadvisor";
export const FACEBOOK_URL = "https://www.facebook.com/luxride.eg/";
export const INSTAGRAM_URL = "https://www.instagram.com/luxride.eg/";

// ─── Fees & rules ─────────────────────────────────────────────────────────────
export const AIRPORT_SURCHARGE = 2; // €, once per booking on Hurghada Airport routes
export const DRIVER_OVERNIGHT = 42; // €, per night for overnight round trips
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
  category: "Sedan" | "Family Car" | "Minivan";
  categoryAr: "سيدان" | "سيارة عائلية" | "ميني فان";
  image: string;
  pax: number;
  luggage: number;
  capacityEn: string;
  capacityAr: string;
  permitTier: PermitTier;
  available: boolean;
  wifi: boolean;
  tagline: string;
  taglineAr: string;
}

export const FLEET: Vehicle[] = [
  {
    id: "xpander",
    name: "Mitsubishi Xpander 2027",
    category: "Family Car",
    categoryAr: "سيارة عائلية",
    image: VEHICLE_IMAGES.xpander,
    pax: 4,
    luggage: 4,
    capacityEn: "Up to 4 passengers and 4 bags",
    capacityAr: "حتى 4 ركاب و4 حقائب",
    permitTier: "mpv",
    available: true,
    wifi: true,
    tagline: "Ideal for families and small groups",
    taglineAr: "مثالية للعائلات والمجموعات الصغيرة",
  },
  {
    id: "corolla",
    name: "Toyota Corolla",
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
    tagline: "Comfortable private car for couples and solo travellers",
    taglineAr: "سيارة مريحة للأزواج والمسافرين بمفردهم",
  },
  {
    id: "hiace",
    name: "Toyota HiAce",
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
    tagline: "For larger groups and extra luggage",
    taglineAr: "للمجموعات الأكبر والأمتعة الإضافية",
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
  vehiclePrices: Record<VehicleId, Partial<Record<TripType, number>>>;
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

const APPROVED_WORKBOOK_ROWS = WORKBOOK_PRICE_LIST_ROWS;
export const DRAFT_ROUTE_REFERENCES: WorkbookRouteRow[] = [];
export { WORKBOOK_PRICE_LIST_META };

function workbookReturnMode(row: WorkbookRouteRow): RoundTripMode {
  return row.roundTripClassification;
}

function routeDuration(row: WorkbookRouteRow): string {
  if ([row.pickup, row.destination].includes("Hurghada Airport") && [row.pickup, row.destination].includes("Hurghada City Center")) return "20 min";
  if ([row.pickup, row.destination].includes("Luxor")) return "4 h";
  if ([row.pickup, row.destination].includes("Cairo")) return "5 h 30 min";
  if ([row.pickup, row.destination].includes("Aswan")) return "7 h";
  if ([row.pickup, row.destination].includes("Alexandria")) return "8 h";
  if ([row.pickup, row.destination].includes("Sharm El Sheikh")) return "6 h";
  if ([row.pickup, row.destination].includes("Marsa Alam")) return "3 h";
  if ([row.pickup, row.destination].includes("Wadi El Gemal")) return "4 h";
  if ([row.pickup, row.destination].includes("Hamata")) return "4 h";
  if ([row.pickup, row.destination].includes("Marsa Ghaleb") || [row.pickup, row.destination].includes("Porto Ghaleb")) return "2 h 30 min";
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
  if (row.pickup === "Hurghada Airport" && row.destination === "Hurghada City Center") return IMAGES.hurghada;
  if (row.pickup === "Hurghada City Center" && row.destination === "Hurghada Airport") return IMAGES.cityAirportTransfer;
  if (row.destination === "Hurghada Airport") return IMAGES.airport;
  if (key.includes("Luxor")) return IMAGES.luxor;
  if (key.includes("Aswan")) return IMAGES.aswan;
  if (key.includes("Cairo") || key.includes("Zaafarana")) return IMAGES.cairo;
  if (key.includes("Alexandria")) return IMAGES.alexandria;
  if (key.includes("Sharm El Sheikh")) return IMAGES.sharm;
  if (key.includes("Wadi El Gemal") || key.includes("Sharm El Luli") || key.includes("El Qulaan") || key.includes("Abu Dabbab")) return IMAGES.wadiElGemal;
  if (key.includes("Marsa Alam") || key.includes("Marsa Ghaleb") || key.includes("Porto Ghaleb") || key.includes("Hamata") || key.includes("El Quseir")) return IMAGES.marsaAlam;
  if (key.includes("Sahl Hasheesh")) return IMAGES.sahlHasheesh;
  if (key.includes("El Gouna")) return IMAGES.elGouna;
  if (key.includes("Makadi")) return IMAGES.makadi;
  if (key.includes("Soma Bay") || key.includes("Safaga")) return IMAGES.soma;
  if (key.includes("Village Road")) return IMAGES.villageRoad;
  if (key.includes("Al Ahyaa")) return IMAGES.alAhyaa;
  return IMAGES.hurghada;
}

export function workbookOneWayPrice(row: WorkbookRouteRow, vehicle: Vehicle): number {
  if (vehicle.id === "corolla") return row.sedanOneWay;
  if (vehicle.id === "hiace") return row.minivanOneWay;
  return row.mpvOneWay;
}

export function workbookRoundTripPrice(row: WorkbookRouteRow, vehicle: Vehicle): number {
  if (vehicle.id === "corolla") return row.sedanRoundTrip;
  if (vehicle.id === "hiace") return row.minivanRoundTrip;
  return row.mpvRoundTrip;
}

function routeFromWorkbook(row: WorkbookRouteRow): Route {
  const roundTripMode = workbookReturnMode(row);
  return {
    id: row.id,
    sourceRow: row.sourceRow,
    from: row.pickup,
    to: row.destination,
    fromAr: row.pickupAr,
    toAr: row.destinationAr,
    mpvOneWay: row.mpvOneWay,
    prices: { oneWay: row.mpvOneWay, [roundTripMode]: row.mpvRoundTrip },
    vehiclePrices: {
      corolla: { oneWay: row.sedanOneWay, [roundTripMode]: row.sedanRoundTrip },
      xpander: { oneWay: row.mpvOneWay, [roundTripMode]: row.mpvRoundTrip },
      hiace: { oneWay: row.minivanOneWay, [roundTripMode]: row.minivanRoundTrip },
    },
    duration: routeDuration(row),
    image: routeImage(row),
    airport: row.airportFeeApplicable,
    permit: row.permitRequired,
    accommodationRequired: roundTripMode === "overnight",
    outboundClassification: row.outboundTripName,
    returnClassification: row.returnTripName,
    returnClassificationAr: row.returnTripNameAr,
    draftStatus: row.draftStatus,
  };
}

export const ROUTES: Route[] = APPROVED_WORKBOOK_ROWS.map(routeFromWorkbook);

interface ApiRoutePrice {
  one_way?: number;
  round_trip?: number;
}

interface ApiRoute {
  id: number;
  route_code: string;
  pickup: { key: string; label: string; ar?: string };
  destination: { key: string; label: string; ar?: string };
  recommended_trip_type?: "one_way" | "round_trip";
  round_trip_classification?: RoundTripMode;
  airport_fee_applicable?: boolean;
  permit_required?: boolean;
  prices?: Partial<Record<"sedan" | "mpv" | "minivan", ApiRoutePrice>>;
}

export function routeFromApiRoute(row: ApiRoute): Route {
  const roundTripMode = row.round_trip_classification === "overnight" ? "overnight" : "overday";
  const prices = row.prices ?? {};
  return {
    id: row.route_code || String(row.id),
    from: row.pickup.label,
    to: row.destination.label,
    fromAr: row.pickup.ar ?? "",
    toAr: row.destination.ar ?? "",
    mpvOneWay: prices.mpv?.one_way,
    prices: { oneWay: prices.mpv?.one_way, [roundTripMode]: prices.mpv?.round_trip },
    vehiclePrices: {
      corolla: { oneWay: prices.sedan?.one_way, [roundTripMode]: prices.sedan?.round_trip },
      xpander: { oneWay: prices.mpv?.one_way, [roundTripMode]: prices.mpv?.round_trip },
      hiace: { oneWay: prices.minivan?.one_way, [roundTripMode]: prices.minivan?.round_trip },
    },
    duration: "on request",
    image: routeImage({
      pickup: row.pickup.label,
      destination: row.destination.label,
    } as WorkbookRouteRow),
    airport: Boolean(row.airport_fee_applicable),
    permit: Boolean(row.permit_required),
    accommodationRequired: roundTripMode === "overnight",
    outboundClassification: "",
    returnClassification: roundTripMode,
    returnClassificationAr: roundTripMode === "overnight" ? "رحلة مع مبيت" : "جولة يوم كامل",
    draftStatus: "confirmed",
  };
}

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
  return pickupLocationsFor(ROUTES);
}

export function pickupLocationsFor(routes: readonly Route[]): string[] {
  return Array.from(new Set(routes.map((r) => r.from)));
}

export function destinationsFor(from: string): string[] {
  return destinationsForRoutes(ROUTES, from);
}

export function destinationsForRoutes(routes: readonly Route[], from: string): string[] {
  return routes.filter((r) => r.from === from).map((r) => r.to);
}

export function findRoute(from: string, to: string): Route | undefined {
  return findRouteIn(ROUTES, from, to);
}

export function findRouteIn(routes: readonly Route[], from: string, to: string): Route | undefined {
  return routes.find((r) => r.from === from && r.to === to);
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
  const base = route.vehiclePrices[vehicle.id]?.[trip];
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
  displayFrom?: Partial<Record<"EN" | "AR", string>>;
  displayTo?: Partial<Record<"EN" | "AR", string>>;
}

function popularTransfer(
  id: string,
  from: string,
  to: string,
  image: string,
  options: Pick<PopularTransfer, "displayFrom" | "displayTo"> = {},
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
    displayFrom: options.displayFrom,
    displayTo: options.displayTo,
  };
}

export const POPULAR_TRANSFERS: PopularTransfer[] = [
  popularTransfer("hurghada-city-airport", "Hurghada City Center", "Hurghada Airport", IMAGES.cityAirportTransfer, {
    displayFrom: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
  popularTransfer("airport-hurghada", "Hurghada Airport", "Hurghada City Center", IMAGES.hurghada, {
    displayTo: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
  popularTransfer("airport-makadi", "Hurghada Airport", "Makadi Bay", IMAGES.makadi),
  popularTransfer("airport-gouna", "Hurghada Airport", "El Gouna", IMAGES.elGouna),
  popularTransfer("airport-sahl", "Hurghada Airport", "Sahl Hasheesh", IMAGES.sahlHasheesh),
  popularTransfer("airport-village", "Hurghada Airport", "Village Road", IMAGES.villageRoad),
  popularTransfer("airport-ahyaa", "Hurghada Airport", "Al Ahyaa Subdivisions", IMAGES.alAhyaa, {
    displayTo: { EN: "Al Ahyaa", AR: "الأحياء" },
  }),
  popularTransfer("hurghada-luxor", "Hurghada City Center", "Luxor", IMAGES.luxor, {
    displayFrom: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
  popularTransfer("hurghada-cairo", "Hurghada City Center", "Cairo", IMAGES.cairo, {
    displayFrom: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
  popularTransfer("hurghada-marsa-alam", "Hurghada City Center", "Marsa Alam", IMAGES.marsaAlam, {
    displayFrom: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
  popularTransfer("hurghada-wadi-el-gemal", "Hurghada City Center", "Wadi El Gemal", IMAGES.wadiElGemal, {
    displayFrom: { EN: "Hurghada City", AR: "مدينة الغردقة" },
  }),
];

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  if (!EMAIL) return "#";
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
