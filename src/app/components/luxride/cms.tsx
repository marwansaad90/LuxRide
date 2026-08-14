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

function normalizeSettings(settings?: Partial<LuxRideSettings>): LuxRideSettings {
  return { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
}

export function normalizeLuxRideContent(raw: Partial<LuxRideContent> | undefined): LuxRideContent | null {
  if (!raw) return null;

  const vehicles = ordered(raw.vehicles).filter((vehicle): vehicle is Vehicle => Boolean(vehicle?.id));
  const popularTransfers = ordered(raw.popularTransfers).filter((transfer): transfer is CmsDestination => Boolean(transfer?.id));
  const destinationGroups = ordered(raw.destinationGroups as Array<CmsDestinationGroup & { displayOrder?: number }> | undefined)
    .filter((group) => Boolean(group?.en && group?.ar))
    .map((group) => ({
      en: group.en,
      ar: group.ar,
      routes: ordered(group.routes).filter((route): route is CmsDestination => Boolean(route?.from && route?.to)),
    }));
  const experiences = ordered(raw.experiences as Array<FeaturedTransfer & { displayOrder?: number }> | undefined)
    .filter((item): item is FeaturedTransfer => Boolean(item?.id && item?.images?.length));
  const faqs = ordered(raw.faqs).filter((item): item is CmsFaqItem => Boolean(item?.id && item?.q && item?.a));

  if (!vehicles.length || !popularTransfers.length || !experiences.length || !faqs.length) {
    return null;
  }

  return {
    source: raw.source === "wordpress" ? "wordpress" : "development-fallback",
    settings: normalizeSettings(raw.settings),
    vehicles,
    popularTransfers,
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
