import { useEffect } from "react";
import { useLocation } from "react-router";
import { useFaqItems, useSiteSettings, type LuxRideSettings } from "./cms";
import type { Lang } from "./i18n";

export const SITE_URL = typeof window === "undefined" ? "https://luxdure.pages.dev" : window.location.origin;
export const OG_IMAGE_URL = `${SITE_URL}/luxride-og-image.webp`;

export interface SeoConfig {
  path: string;
  title: string;
  description: string;
}

export const PUBLIC_SEO_ROUTES: SeoConfig[] = [
  {
    path: "/",
    title: "LuxRide Taxi | Private Transfers in Hurghada, Egypt",
    description: "Book Hurghada private transfers, airport transfers, fixed-price Red Sea resort rides, and long-distance LuxRide Taxi service in modern air-conditioned vehicles.",
  },
  {
    path: "/about",
    title: "About LuxRide Taxi | Private Transfers in Hurghada",
    description: "Learn about LuxRide Taxi private transfer service for Hurghada, Red Sea resorts, airport pickups, and long-distance destinations across Egypt.",
  },
  {
    path: "/fleet",
    title: "LuxRide Fleet | Private Transfer Vehicles in Hurghada",
    description: "View LuxRide Taxi vehicles for private transfers in Hurghada, including Sedan, MPV, and Mini Van options matched to passenger and luggage needs.",
  },
  {
    path: "/destinations",
    title: "Private Transfers from Hurghada | LuxRide Taxi",
    description: "Explore fixed-price private transfers from Hurghada to the airport, El Gouna, Makadi Bay, Soma Bay, Luxor, Cairo, Aswan, Marsa Alam, and more.",
  },
  {
    path: "/experiences",
    title: "Unforgettable Transfer Experiences | LuxRide Taxi",
    description: "Browse selected LuxRide Taxi private transfer experiences and book a similar fixed-price transfer from Hurghada with route details prepared.",
  },
  {
    path: "/booking",
    title: "Book a Private Transfer in Hurghada | LuxRide Taxi",
    description: "Calculate and request your LuxRide Taxi private transfer with fixed pricing, route details, vehicle choice, and applicable airport or permit fees shown clearly.",
  },
  {
    path: "/faq",
    title: "LuxRide Taxi FAQ | Hurghada Private Transfers",
    description: "Answers about LuxRide Taxi booking, fixed prices, airport pickup, flight monitoring, travel permits, round trips, and cancellation policy.",
  },
  {
    path: "/contact",
    title: "Contact LuxRide Taxi | Hurghada Transfers",
    description: "Contact LuxRide Taxi for Hurghada private transfers by phone, WhatsApp, email, Facebook, Instagram, or Tripadvisor.",
  },
  {
    path: "/cancellation-policy",
    title: "LuxRide Cancellation Policy | Private Transfers Hurghada",
    description: "Review the LuxRide Taxi cancellation terms for private transfer bookings and experience start-time rules.",
  },
  {
    path: "/privacy-policy",
    title: "LuxRide Privacy Policy | Hurghada Private Transfers",
    description: "Read how LuxRide Taxi handles booking details, contact information, and private transfer request data.",
  },
  {
    path: "/terms",
    title: "LuxRide Terms and Conditions | Private Transfers Hurghada",
    description: "Review LuxRide Taxi terms for private transfers, booking requests, route pricing, airport pickup, permits, and customer responsibilities.",
  },
];

const LEGACY_CANONICALS: Record<string, string> = {
  "/featured-transfers": "/experiences",
  "/journeys": "/experiences",
};

function normalizePath(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function canonicalPath(pathname: string): string {
  const normalized = normalizePath(pathname);
  return LEGACY_CANONICALS[normalized] ?? normalized;
}

function configFor(pathname: string): SeoConfig {
  const canonical = canonicalPath(pathname);
  if (canonical === "/transfer-details") {
    return {
      path: canonical,
      title: "Private Transfer Details | LuxRide Taxi",
      description: "Review LuxRide Taxi private transfer route details, fixed prices, vehicle options, and booking links for selected Hurghada transfers.",
    };
  }
  return PUBLIC_SEO_ROUTES.find((route) => route.path === canonical) ?? {
    path: pathname,
    title: "Page Not Found | LuxRide Taxi",
    description: "The requested LuxRide Taxi page could not be found. Return to booking, destinations, experiences, or contact pages.",
  };
}

function setMeta(selector: string, attributes: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
}

function setLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const selector = `link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ""}`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  Object.entries(extra).forEach(([key, value]) => el.setAttribute(key, value));
}

function removeManagedJsonLd() {
  document.head.querySelectorAll('script[data-luxride-seo="jsonld"]').forEach((node) => node.remove());
}

function addJsonLd(data: unknown) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.luxrideSeo = "jsonld";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function breadcrumbJsonLd(config: SeoConfig, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(config.path === "/" ? [] : [{ "@type": "ListItem", position: 2, name: config.title.split("|")[0].trim(), item: canonicalUrl }]),
    ],
  };
}

function localBusinessJsonLd(settings: LuxRideSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "LuxRide Taxi",
    telephone: settings.phoneDisplay,
    email: settings.email,
    url: SITE_URL,
    image: OG_IMAGE_URL,
    areaServed: ["Hurghada", "Red Sea", "Egypt"],
    sameAs: [settings.facebookUrl, settings.instagramUrl, settings.tripadvisorUrl].filter(Boolean),
  };
}

function serviceJsonLd(canonicalUrl: string, settings: LuxRideSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Private transfers in Hurghada",
    serviceType: "Private transfer service",
    provider: { "@type": "LocalBusiness", name: "LuxRide Taxi", telephone: settings.phoneDisplay, email: settings.email },
    areaServed: ["Hurghada", "Red Sea", "Egypt"],
    url: canonicalUrl,
  };
}

function faqJsonLd(lang: Lang, faqs: ReturnType<typeof useFaqItems>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q[lang],
      acceptedAnswer: { "@type": "Answer", text: item.a[lang] },
    })),
  };
}

export function useLuxRideSeo(lang: Lang) {
  const { pathname } = useLocation();
  const settings = useSiteSettings();
  const pageFaqs = useFaqItems("page");

  useEffect(() => {
    const config = configFor(pathname);
    const canonicalUrl = `${SITE_URL}${canonicalPath(pathname)}`;
    const isNotFound = config.title.startsWith("Page Not Found");

    document.title = config.title;
    setMeta('meta[name="description"]', { name: "description", content: config.description });
    setMeta('meta[name="robots"]', { name: "robots", content: isNotFound ? "noindex,follow" : "index,follow" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: config.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: config.description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: "og:image", content: OG_IMAGE_URL });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: config.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: config.description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: OG_IMAGE_URL });
    setLink("canonical", canonicalUrl);

    removeManagedJsonLd();
    if (!isNotFound) {
      addJsonLd(breadcrumbJsonLd(config, canonicalUrl));
      if (pathname === "/") addJsonLd(localBusinessJsonLd(settings));
      if (["/", "/destinations", "/booking", "/experiences"].includes(canonicalPath(pathname))) addJsonLd(serviceJsonLd(canonicalUrl, settings));
      if (pathname === "/faq") addJsonLd(faqJsonLd(lang, pageFaqs));
    }
  }, [pathname, lang, settings, pageFaqs]);
}
