import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  POPULAR_TRANSFERS,
  SELECTABLE_FLEET,
  TRIPADVISOR_URL,
  WHATSAPP_NUMBER,
  type PopularTransfer,
  type Vehicle,
} from "./data";
import { FAQ_PAGE_ITEMS } from "./faqPageData";
import { FAQS } from "./i18n";
import { FEATURED_TRANSFERS, type FeaturedTransfer } from "./journeys";

export interface LuxRideSettings {
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  tripadvisorUrl: string;
}

export interface CmsDestination extends PopularTransfer {
  displayOrder: number;
  contexts: Array<"popular" | "destination" | "seo">;
  group?: { EN: string; AR: string };
  imagePosition?: string;
}

export interface CmsDestinationGroup {
  en: string;
  ar: string;
  routes: CmsDestination[];
}

export interface CmsFaqItem {
  id: string;
  context: "home" | "page";
  q: { EN: string; AR: string };
  a: { EN: string; AR: string };
  displayOrder: number;
}

export interface LuxRideContent {
  source: "wordpress" | "development-fallback";
  settings: LuxRideSettings;
  vehicles: Vehicle[];
  popularTransfers: CmsDestination[];
  destinationGroups: CmsDestinationGroup[];
  experiences: FeaturedTransfer[];
  faqs: CmsFaqItem[];
}

declare global {
  interface Window {
    __LUXRIDE_BOOTSTRAP__?: Partial<LuxRideContent>;
  }
}

const DEFAULT_SETTINGS: LuxRideSettings = {
  phoneDisplay: PHONE_DISPLAY,
  whatsappNumber: WHATSAPP_NUMBER,
  email: EMAIL,
  facebookUrl: FACEBOOK_URL,
  instagramUrl: INSTAGRAM_URL,
  tripadvisorUrl: TRIPADVISOR_URL,
};

const PUBLIC_ROUTE_ALIASES: Record<string, { routeKey: string; label: { EN: string; AR: string } }> = {
  Hurghada: { routeKey: "Hurghada City Center", label: { EN: "Hurghada", AR: "الغردقة" } },
  "Al Ahyaa": { routeKey: "Al Ahyaa Subdivisions", label: { EN: "Al Ahyaa", AR: "الأحياء" } },
};

const FIRST_HOME_TRANSFER_ID = "hurghada-city-airport";

const fallbackFaqs: CmsFaqItem[] = [
  ...FAQS.EN.map((item, index) => ({
    id: `home-${index + 1}`,
    context: "home" as const,
    q: { EN: item.q, AR: FAQS.AR[index]?.q ?? item.q },
    a: { EN: item.a, AR: FAQS.AR[index]?.a ?? item.a },
    displayOrder: index + 1,
  })),
  ...FAQ_PAGE_ITEMS.EN.map((item, index) => ({
    id: `page-${index + 1}`,
    context: "page" as const,
    q: { EN: item.q, AR: FAQ_PAGE_ITEMS.AR[index]?.q ?? item.q },
    a: { EN: item.a, AR: FAQ_PAGE_ITEMS.AR[index]?.a ?? item.a },
    displayOrder: index + 1,
  })),
];

const fallbackContent: LuxRideContent = {
  source: "development-fallback",
  settings: DEFAULT_SETTINGS,
  vehicles: SELECTABLE_FLEET,
  popularTransfers: POPULAR_TRANSFERS.map((transfer, index) => ({
    ...transfer,
    displayOrder: index + 1,
    contexts: ["popular"],
  })),
  destinationGroups: [],
  experiences: FEATURED_TRANSFERS,
  faqs: fallbackFaqs,
};

function ordered<T>(items: T[] | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => {
    const aOrder = (a as { displayOrder?: number }).displayOrder ?? 9999;
    const bOrder = (b as { displayOrder?: number }).displayOrder ?? 9999;
    return aOrder - bOrder;
  });
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
    const normalized = code.toLowerCase();
    if (normalized === "amp") return "&";
    if (normalized === "lt") return "<";
    if (normalized === "gt") return ">";
    if (normalized === "quot") return "\"";
    if (normalized === "apos") return "'";
    const numeric = normalized.startsWith("#x")
      ? parseInt(normalized.slice(2), 16)
      : normalized.startsWith("#")
      ? parseInt(normalized.slice(1), 10)
      : NaN;
    return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
  });
}

function decodeContentStrings<T>(value: T): T {
  if (typeof value === "string") return decodeHtmlEntities(value) as T;
  if (Array.isArray(value)) return value.map((item) => decodeContentStrings(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, decodeContentStrings(item)]),
    ) as T;
  }
  return value;
}

function normalizeSettings(settings?: Partial<LuxRideSettings>): LuxRideSettings {
  return { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function publicRouteKey(value: string): string {
  return PUBLIC_ROUTE_ALIASES[value]?.routeKey ?? value;
}

function compactDisplayLabel(existing: CmsDestination["displayFrom"]): CmsDestination["displayFrom"] | undefined {
  const displayLabel: NonNullable<CmsDestination["displayFrom"]> = {};
  if (hasText(existing?.EN)) displayLabel.EN = existing.EN;
  if (hasText(existing?.AR)) displayLabel.AR = existing.AR;
  return Object.keys(displayLabel).length ? displayLabel : undefined;
}

function publicDisplayLabel(value: string, existing: CmsDestination["displayFrom"]): CmsDestination["displayFrom"] | undefined {
  const alias = PUBLIC_ROUTE_ALIASES[value];
  if (!alias) return compactDisplayLabel(existing);

  return {
    EN: hasText(existing?.EN) ? existing.EN : alias.label.EN,
    AR: hasText(existing?.AR) ? existing.AR : alias.label.AR,
  };
}

function normalizeCmsDestinationRoute(destination: CmsDestination): CmsDestination {
  return {
    ...destination,
    from: publicRouteKey(destination.from),
    to: publicRouteKey(destination.to),
    displayFrom: publicDisplayLabel(destination.from, destination.displayFrom),
    displayTo: publicDisplayLabel(destination.to, destination.displayTo),
    imagePosition: destination.id === "hurghada-city-airport"
      ? "center 58%"
      : destination.id === "airport-hurghada"
      ? "center 46%"
      : destination.imagePosition,
  };
}

function normalizeVehicle(vehicle: Vehicle): Vehicle {
  if (vehicle.id === "xpander") return { ...vehicle, category: "MPV", categoryAr: "MPV" };
  if (vehicle.id === "hiace") return { ...vehicle, category: "Mini Van", categoryAr: "ميني فان" };
  return vehicle;
}

function orderPopularTransfers(transfers: CmsDestination[]): CmsDestination[] {
  return [...transfers].sort((a, b) => {
    if (a.id === FIRST_HOME_TRANSFER_ID) return -1;
    if (b.id === FIRST_HOME_TRANSFER_ID) return 1;
    return 0;
  });
}

export function normalizeLuxRideContent(raw: Partial<LuxRideContent> | undefined): LuxRideContent | null {
  if (!raw) return null;
  const content = decodeContentStrings(raw);

  const vehicles = ordered(content.vehicles)
    .filter((vehicle): vehicle is Vehicle => Boolean(vehicle?.id))
    .map(normalizeVehicle);
  const popularTransfers = ordered(content.popularTransfers)
    .filter((transfer): transfer is CmsDestination => Boolean(transfer?.id))
    .map(normalizeCmsDestinationRoute);
  const destinationGroups = ordered(content.destinationGroups as Array<CmsDestinationGroup & { displayOrder?: number }> | undefined)
    .filter((group) => Boolean(group?.en && group?.ar))
    .map((group) => ({
      en: group.en,
      ar: group.ar,
      routes: ordered(group.routes)
        .filter((route): route is CmsDestination => Boolean(route?.from && route?.to))
        .map(normalizeCmsDestinationRoute),
    }));
  const experiences = ordered(content.experiences as Array<FeaturedTransfer & { displayOrder?: number }> | undefined)
    .filter((item): item is FeaturedTransfer => Boolean(item?.id && item?.images?.length));
  const faqs = ordered(content.faqs).filter((item): item is CmsFaqItem => Boolean(item?.id && item?.q && item?.a));

  if (!vehicles.length || !popularTransfers.length || !experiences.length || !faqs.length) {
    return null;
  }

  return {
    source: content.source === "wordpress" ? "wordpress" : "development-fallback",
    settings: normalizeSettings(content.settings),
    vehicles,
    popularTransfers: orderPopularTransfers(popularTransfers),
    destinationGroups,
    experiences,
    faqs,
  };
}

function isProductionHost(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "luxride-eg.com" || window.location.hostname === "www.luxride-eg.com";
}

function readContent(): LuxRideContent | null {
  const content = normalizeLuxRideContent(typeof window === "undefined" ? undefined : window.__LUXRIDE_BOOTSTRAP__);
  if (content) return content;
  return isProductionHost() ? null : fallbackContent;
}

const LuxRideContentContext = createContext<LuxRideContent | null>(null);

export function LuxRideContentProvider({ children }: { children: ReactNode }) {
  const content = useMemo(readContent, []);

  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-lux-dark px-6 text-center text-lux-beige">
        <div>
          <h1 className="text-2xl font-bold">LuxRide content is unavailable</h1>
          <p className="mt-3 text-sm text-lux-beige/70">The WordPress content source did not load.</p>
        </div>
      </div>
    );
  }

  return <LuxRideContentContext.Provider value={content}>{children}</LuxRideContentContext.Provider>;
}

export function useLuxRideContent(): LuxRideContent {
  const content = useContext(LuxRideContentContext);
  if (!content) {
    throw new Error("useLuxRideContent must be used inside LuxRideContentProvider");
  }
  return content;
}

export function useSiteSettings(): LuxRideSettings {
  return useLuxRideContent().settings;
}

export function useVehicles(): Vehicle[] {
  return useLuxRideContent().vehicles;
}

export function usePopularTransfers(): CmsDestination[] {
  return useLuxRideContent().popularTransfers;
}

export function useDestinationGroups(): CmsDestinationGroup[] {
  return useLuxRideContent().destinationGroups;
}

export function useExperiences(): FeaturedTransfer[] {
  return useLuxRideContent().experiences;
}

export function useFaqItems(context: "home" | "page"): CmsFaqItem[] {
  return useLuxRideContent().faqs.filter((item) => item.context === context);
}

export function settingsWhatsappLink(settings: LuxRideSettings, message: string): string {
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function settingsTelHref(settings: LuxRideSettings): string {
  return `tel:${settings.phoneDisplay.replace(/[^\d+]/g, "")}`;
}
