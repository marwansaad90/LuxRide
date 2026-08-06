import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACTIVE_FLEET,
  AIRPORT_SURCHARGE,
  CLIENT_REVIEW_ENABLE_ALL_VEHICLES,
  FACEBOOK_URL,
  FLEET,
  INSTAGRAM_URL,
  PERMIT_FEE,
  PRODUCTION_ACTIVE_FLEET,
  ROUTE_TRIP_RULES,
  SELECTABLE_FLEET,
  availablePublicTripTypes,
  availableTripTypes,
  computePrice,
  destinationsFor,
  findRoute,
  resolveTripType,
  tripRulesFor,
} from "./data";
import { normalizeReturnFields, isValidReturn, readInitialBookingState } from "./bookingState";
import {
  TRIPADVISOR_LOCATION_ID,
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  tripadvisorWidgetScriptUrl,
} from "./tripadvisor";

const xpander = FLEET.find((vehicle) => vehicle.id === "xpander")!;
const corolla = FLEET.find((vehicle) => vehicle.id === "corolla")!;
const hiace = FLEET.find((vehicle) => vehicle.id === "hiace")!;

function price(from: string, to: string, trip: "oneWay" | "overday" | "overnight") {
  const route = findRoute(from, to);
  expect(route).toBeDefined();
  return computePrice(route!, trip, xpander);
}

describe("approved LuxRide pricing", () => {
  it("keeps Luxor One Way at the approved €75 base", () => {
    expect(price("Hurghada", "Luxor", "oneWay")?.base).toBe(75);
  });

  it("uses the fixed €90 Luxor Overday base instead of doubling One Way", () => {
    expect(price("Hurghada", "Luxor", "overday")?.base).toBe(90);
  });

  it("uses the approved Sharm El Sheikh prices", () => {
    expect(price("Hurghada", "Sharm El Sheikh", "oneWay")?.base).toBe(200);
    expect(price("Hurghada", "Sharm El Sheikh", "overnight")?.base).toBe(250);
  });

  it("uses the approved El Gouna to Luxor prices", () => {
    expect(price("El Gouna", "Luxor", "oneWay")?.base).toBe(85);
    expect(price("El Gouna", "Luxor", "overday")?.base).toBe(100);
  });

  it("uses the approved Cairo Overday prices", () => {
    expect(price("Hurghada", "Cairo", "oneWay")?.base).toBe(110);
    expect(price("Hurghada", "Cairo", "overday")?.base).toBe(120);
    expect(price("Makadi Bay", "Cairo", "overday")?.base).toBe(135);
    expect(price("Safaga", "Cairo", "overday")?.base).toBe(135);
  });

  it("uses the approved Alexandria Overnight price without inventing other trip types", () => {
    expect(price("Hurghada", "Alexandria", "overnight")?.base).toBe(180);
    expect(price("Hurghada", "Alexandria", "oneWay")).toBeNull();
    expect(price("Hurghada", "Alexandria", "overday")).toBeNull();
  });

  it("applies the airport surcharge exactly once", () => {
    const result = price("Hurghada Airport", "El Gouna", "oneWay")!;
    expect(result.airport).toBe(AIRPORT_SURCHARGE);
    expect(result.total).toBe(15);
  });

  it("applies permit fees exactly once based on selected vehicle", () => {
    expect(price("Hurghada", "Luxor", "oneWay")?.permit).toBe(PERMIT_FEE.mpv);
    const route = findRoute("Hurghada", "Luxor")!;
    expect(computePrice(route, "overday", corolla)?.permit).toBe(PERMIT_FEE.sedan);
    expect(computePrice(route, "overday", hiace)?.permit).toBe(PERMIT_FEE.minivan);
  });

  it("removes the unconfirmed Luxor discount while keeping fees separate", () => {
    const result = price("Hurghada", "Luxor", "oneWay")!;
    expect(result).toMatchObject({
      base: 75,
      discount: 0,
      subtotal: 75,
      airport: 0,
      permit: 20,
      overnight: 0,
      total: 95,
    });
  });

  it("retains discount support for a future explicitly configured offer", () => {
    const configuredRoute = { ...findRoute("Hurghada", "Luxor")!, discountPct: 10 };
    expect(computePrice(configuredRoute, "oneWay", xpander)).toMatchObject({
      base: 75,
      discount: 7.5,
      subtotal: 67.5,
      total: 87.5,
    });
  });

  it("does not guess a price for an unsupported trip type", () => {
    expect(price("Hurghada Airport", "El Gouna", "overday")).toBeNull();
    expect(availableTripTypes(findRoute("Hurghada Airport", "El Gouna"))).toEqual(["oneWay"]);
    expect(availablePublicTripTypes(findRoute("Hurghada Airport", "El Gouna"))).toEqual(["oneWay"]);
  });

  it("does not add driver accommodation without a confirmed route rule", () => {
    expect(price("Hurghada", "Sharm El Sheikh", "overnight")?.overnight).toBe(0);
  });
});

describe("vehicle and route validation", () => {
  it("uses the confirmed official social URLs from centralized client data", () => {
    expect(FACEBOOK_URL).toBe("https://www.facebook.com/luxride.eg/");
    expect(INSTAGRAM_URL).toBe("https://www.instagram.com/luxride.eg/");
  });

  it("preserves production availability while enabling all vehicles for client review", () => {
    expect(CLIENT_REVIEW_ENABLE_ALL_VEHICLES).toBe(true);
    expect(PRODUCTION_ACTIVE_FLEET.map((vehicle) => vehicle.id)).toEqual(["xpander"]);
    expect(ACTIVE_FLEET.map((vehicle) => vehicle.id)).toEqual(["xpander"]);
    expect(SELECTABLE_FLEET.map((vehicle) => vehicle.id)).toEqual(["corolla", "xpander", "hiace"]);
  });

  it("keeps the approved vehicle passenger and luggage limits", () => {
    expect(FLEET.map(({ id, pax, luggage, available }) => ({ id, pax, luggage, available }))).toEqual([
      { id: "xpander", pax: 4, luggage: 4, available: true },
      { id: "corolla", pax: 3, luggage: 2, available: false },
      { id: "hiace", pax: 8, luggage: 8, available: false },
    ]);
  });

  it("uses optimized client vehicle assets from the vehicle asset folder", () => {
    const data = readSource("./data.ts");
    expect(data).toContain("../../../assets/vehicles/xpander.webp");
    expect(data).toContain("../../../assets/vehicles/corolla.webp");
    expect(data).toContain("../../../assets/vehicles/hiace.webp");
    expect(hiace.tagline).toBe("Roomy minivan for larger groups and extra luggage");
  });

  it("maps public Round Trip choices to the approved internal route classifications", () => {
    const luxor = findRoute("Hurghada", "Luxor");
    const sharm = findRoute("Hurghada", "Sharm El Sheikh");
    const alexandria = findRoute("Hurghada", "Alexandria");

    expect(tripRulesFor(luxor)).toMatchObject({ oneWayPrice: 75, roundTripMode: "overday", roundTripPrice: 90 });
    expect(ROUTE_TRIP_RULES.l1).toMatchObject({ oneWayPrice: 75, roundTripMode: "overday", roundTripPrice: 90 });
    expect(resolveTripType(luxor, "roundTrip")).toBe("overday");
    expect(resolveTripType(sharm, "roundTrip")).toBe("overnight");
    expect(availablePublicTripTypes(alexandria)).toEqual(["roundTrip"]);
    expect(resolveTripType(alexandria, "oneWay")).toBeNull();
  });

  it("uses only approved cascading destinations", () => {
    expect(destinationsFor("Hurghada Airport")).toEqual([
      "Hurghada",
      "El Gouna",
      "Sahl Hasheesh",
      "Soma Bay",
      "Makadi Bay",
      "Safaga",
      "Nefertari",
      "El Quseir",
      "Marsa Ghaleb",
      "Marsa Alam",
      "Hamata",
    ]);
  });

  it("sanitizes disabled vehicles, capacity, route, trip, date, and time URL values", () => {
    const params = new URLSearchParams({
      from: "Unknown",
      to: "Cairo",
      trip: "overnight",
      vehicle: "hiace",
      pax: "99",
      luggage: "99",
      date: "not-a-date",
      time: "99:99",
    });
    expect(readInitialBookingState(params)).toMatchObject({
      from: "Hurghada Airport",
      to: "Hurghada",
      trip: "oneWay",
      publicTrip: "oneWay",
      vehicleId: "hiace",
      pax: "8",
      luggage: "8",
      date: "",
      time: "",
      corrected: true,
    });
  });

  it("requires an Overday return later on the same date", () => {
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-10", "18:00")).toBe(true);
    expect(isValidReturn("overday", "2026-08-10", "18:00", "2026-08-10", "08:00")).toBe(false);
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-11", "08:00")).toBe(false);
  });

  it("requires an Overnight return on a later date", () => {
    expect(isValidReturn("overnight", "2026-08-10", "20:00", "2026-08-11", "07:00")).toBe(true);
    expect(isValidReturn("overnight", "2026-08-10", "08:00", "2026-08-10", "20:00")).toBe(false);
    expect(isValidReturn("overnight", "2026-08-10", "08:00", "", "")).toBe(false);
  });

  it("normalizes return fields by trip type", () => {
    expect(normalizeReturnFields("oneWay", "2026-08-10", "2026-08-11", "09:00")).toEqual({
      returnDate: "",
      returnTime: "",
    });
    expect(normalizeReturnFields("overday", "2026-08-10", "", "18:00")).toEqual({
      returnDate: "2026-08-10",
      returnTime: "18:00",
    });
    expect(normalizeReturnFields("overnight", "2026-08-10", "2026-08-10", "18:00")).toEqual({
      returnDate: "",
      returnTime: "18:00",
    });
  });
});

function readSource(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function readActiveAppSources(dir: string): string {
  return readdirSync(dir)
    .flatMap((entry) => {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) return readActiveAppSources(fullPath);
      if (!/\.(ts|tsx|css)$/.test(entry) || /\.test\./.test(entry)) return [];
      return readFileSync(fullPath, "utf8");
    })
    .join("\n");
}

describe("final client-review integration", () => {
  it("keeps the homepage calculator only inside the Hero and removes the homepage Destinations section", () => {
    const home = readSource("../../pages/Home.tsx");
    const hero = readSource("./Hero.tsx");
    const routes = readSource("../../routes.tsx");

    expect(home).not.toContain("<DestinationSEO");
    expect(home).not.toContain("EstimateYourTrip");
    expect(hero).toContain("<EstimateYourTrip />");
    expect(routes).toContain('{ path: "destinations", Component: DestinationsPage }');
  });

  it("keeps Popular Transfers on the homepage and uses the new last-minute heading", () => {
    const home = readSource("../../pages/Home.tsx");
    const sections = readSource("./Sections.tsx");

    expect(home).toContain("<PopularTransfers />");
    expect(sections).toContain("Need a transfer within 3 hours?");
    expect(sections).toContain("هل تحتاج إلى توصيلة خلال أقل من 3 ساعات؟");
  });

  it("keeps the approved homepage section order", () => {
    const home = readSource("../../pages/Home.tsx");
    const components = ["<Hero />", "<LastMinute />", "<HowItWorks />", "<ServiceBenefits />", "<PopularTransfers />", "<FeaturedJourneys />", "<Fleet />", "<WhyChoose />", "<Reviews />", "<FAQ />", "<FinalCTA />"];
    const positions = components.map((component) => home.indexOf(component));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("only exposes One Way and Round Trip in the calculator and booking selectors", () => {
    const estimate = readSource("./EstimateYourTrip.tsx");
    const booking = readSource("../../pages/BookingPage.tsx");

    expect(estimate + booking).toContain('id: "roundTrip"');
    expect(estimate + booking).toContain("Trip classification:");
    expect(estimate + booking).not.toContain('id: "overday"');
    expect(estimate + booking).not.toContain('id: "overnight"');
  });

  it("adds Featured Journeys and /journeys with valid booking prefill queries", () => {
    const home = readSource("../../pages/Home.tsx");
    const routes = readSource("../../routes.tsx");
    const journeys = readSource("./journeys.ts");
    const featured = readSource("./FeaturedJourneys.tsx");
    const page = readSource("../../pages/JourneysPage.tsx");

    expect(home).toContain("<FeaturedJourneys />");
    expect(routes).toContain('{ path: "journeys", Component: JourneysPage }');
    expect(journeys).toContain('booking: { from: "Hurghada", to: "Luxor", trip: "roundTrip" }');
    expect(journeys).toContain('booking: { from: "Hurghada", to: "Sharm El Sheikh", trip: "oneWay" }');
    expect(featured + page).toContain("Book Similar Trip");
    expect(featured + page).toContain("Explore All Journeys");
  });

  it("keeps Popular Transfers images at their natural source colors", () => {
    const sections = readSource("./Sections.tsx");
    const popularTransfers = sections
      .split("export function PopularTransfers()")[1]
      .split("export function Fleet()")[0];
    const imageMarkup = popularTransfers.match(/<ImageWithFallback[\s\S]*?\/>/)?.[0] ?? "";

    expect(imageMarkup).toContain('className="popular-transfer-image');
    expect(imageMarkup).toContain('filter: "none"');
    expect(imageMarkup).toContain("opacity: 1");
    expect(imageMarkup).toContain('mixBlendMode: "normal"');
    expect(imageMarkup).not.toMatch(/brightness-|grayscale|bg-black|from-black|to-black/);
  });

  it("uses the latest Tripadvisor widget IDs and real location", () => {
    expect(TRIPADVISOR_LOCATION_ID).toBe("34457256");
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.uniqueId)).toEqual(["470", "935", "782", "489"]);
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.containerId)).toEqual([
      "TA_cdsratingsonlynarrow470",
      "TA_cdswritereviewnew935",
      "TA_cdsscrollingravenarrow782",
      "TA_selfserveprop489",
    ]);
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.widgetType)).toEqual([
      "cdsratingsonlynarrow",
      "cdswritereviewnew",
      "cdsscrollingravenarrow",
      "selfserveprop",
    ]);
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.scriptId)).toEqual([
      "tripadvisor-rating-script-470",
      "tripadvisor-review-starter-script-935",
      "tripadvisor-rave-reviews-script-782",
      "tripadvisor-selfserve-script-489",
    ]);
    expect(TRIPADVISOR_WIDGETS.map(tripadvisorWidgetScriptUrl)).toEqual([
      "https://www.jscache.com/wejs?wtype=cdsratingsonlynarrow&uniq=470&locationId=34457256&lang=en_US&border=true&display_version=2",
      "https://www.jscache.com/wejs?wtype=cdswritereviewnew&uniq=935&locationId=34457256&lang=en_US&display_version=2",
      "https://www.jscache.com/wejs?wtype=cdsscrollingravenarrow&uniq=782&locationId=34457256&lang=en_US&border=true&display_version=2",
      "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=489&locationId=34457256&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=true&iswide=false&border=true&display_version=2",
    ]);
  });

  it("renders the exact official Tripadvisor starter markup without a local fallback", () => {
    const reviews = readSource("./Reviews.tsx");
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));

    expect(TRIPADVISOR_PAGE_URL).toBe(
      "https://www.tripadvisor.com/Attraction_Review-g297549-d34457256-Reviews-LuxRide_Taxi-Hurghada_Red_Sea_and_Sinai.html",
    );
    expect(reviews).not.toContain("Rating pending");
    expect(reviews).not.toContain("Review count required");
    expect(reviews).not.toContain("Rated Excellent");
    expect(reviews).not.toContain("View LuxRide on Tripadvisor");
    expect(reviews).not.toContain("Write a Review on Tripadvisor");
    expect(reviews).not.toContain("Read LuxRide Reviews on Tripadvisor");
    expect(reviews).not.toContain("tripadvisor-lockup.svg");
    expect(reviews).toContain('id="bx4vQmDEZ" className="TA_links DNOhrQ"');
    expect(reviews).toContain('id="UAp0qD9lW" className="TA_links 9ACGKVQ5IA"');
    expect(reviews).toContain('id="LmZYIV0z7lo4" className="TA_links S7dZdrAkw"');
    expect(reviews).toContain('id="f1SxbHPg4yCq" className="TA_links 1SrP6U2R"');
    expect(reviews).toContain('id="CDSWIDEXCLOGO"');
    expect(reviews).not.toContain("config.titleEn");
    expect(reviews).not.toContain("config.titleAr");
    expect(activeCode).not.toContain("Client content required");
    expect(activeCode).not.toContain("Based on 120+ reviews");
    expect(activeCode).not.toContain("بناءً على ١٢٠+ تقييم");
  });

  it("uses two primary widgets, two secondary widgets, and StrictMode-safe script lifecycle", () => {
    const reviews = readSource("./Reviews.tsx");
    const primaryRow = reviews
      .split('data-tripadvisor-row="primary"')[1]
      .split('data-tripadvisor-row="rave"')[0];
    const raveRow = reviews.split('data-tripadvisor-row="rave"')[1];

    expect(primaryRow.match(/<TripadvisorWidget /g)).toHaveLength(2);
    expect(raveRow.match(/<TripadvisorWidget /g)).toHaveLength(2);
    expect(reviews).toContain("scriptHost.replaceChildren()");
    expect(reviews).toContain('script.setAttribute("data-loadtrk", "")');
    expect(reviews).toContain('script?.setAttribute("data-loadtrk", "true")');
    expect(reviews).toContain("resizeRatingsOnlyWidget");
    expect(reviews).toContain("cleanupTimerRef");
    expect(reviews).toContain('WidgetEmbed-${config.widgetType}');
    expect(reviews).toContain('rel="noopener noreferrer"');
  });

  it("keeps internal review routes out of customer navigation and provides working legal routes", () => {
    const header = readSource("./Header.tsx");
    const footer = readSource("./Footer.tsx");
    const routes = readSource("../../routes.tsx");
    const internal = ["availability-admin", "validation-states", "whatsapp-preview", "email-preview", "booking-error"];
    internal.forEach((path) => expect(header + footer).not.toContain(path));
    expect(routes).toContain('{ path: "privacy-policy", Component: PrivacyPolicyPage }');
    expect(routes).toContain('{ path: "terms", Component: TermsPage }');
    expect(routes).toContain('{ path: "journeys", Component: JourneysPage }');
  });

  it("renders confirmed social links in footer and contact with safe external attributes", () => {
    const footer = readSource("./Footer.tsx");
    const contact = readSource("../../pages/ContactPage.tsx");

    expect(footer + contact).toContain("FACEBOOK_URL");
    expect(footer + contact).toContain("INSTAGRAM_URL");
    expect(footer).toContain('href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"');
    expect(footer).toContain('href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"');
  });

  it("keeps both notification previews aligned without physical-capacity wording", () => {
    const preview = readSource("./notificationPreview.ts");
    const whatsapp = readSource("../../pages/WhatsAppPreviewPage.tsx");
    const email = readSource("../../pages/EmailPreviewPage.tsx");
    ["Customer Name", "Trip Classification", "Hotel / Exact Destination", "Accommodation", "Final Total", "Notes"].forEach((field) => expect(preview + whatsapp + email).toContain(field));
    expect(whatsapp).toContain("NOTIFICATION_FIELDS");
    expect(email).toContain("NOTIFICATION_FIELDS");
    expect(preview).not.toMatch(/up to \d+ passengers|physical capacity/i);
  });

  it("keeps exactly one final booking request button", () => {
    const booking = readSource("../../pages/BookingPage.tsx");
    expect(booking.match(/onClick=\{handleSubmit\}/g)).toHaveLength(1);
    expect(booking).toContain('"Send Booking Request"');
    expect(booking).toContain('"إرسال طلب الحجز"');
  });

  it("removes old active Tripadvisor widget IDs and includes mobile sticky CTA visibility logic", () => {
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));
    const rootLayout = readSource("./RootLayout.tsx");

    expect(activeCode).not.toMatch(/uniq=(862|540|178)|uniqueId:\s*"(862|540|178)"/);
    expect(rootLayout).toContain("showMobileActions");
    expect(rootLayout).toContain("IntersectionObserver");
  });
});
