import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACTIVE_FLEET,
  AIRPORT_SURCHARGE,
  CLIENT_REVIEW_ENABLE_ALL_VEHICLES,
  DRAFT_ROUTE_REFERENCES,
  EMAIL,
  FACEBOOK_URL,
  FLEET,
  INSTAGRAM_URL,
  POPULAR_TRANSFERS,
  PRODUCTION_ACTIVE_FLEET,
  ROUTES,
  SELECTABLE_FLEET,
  WORKBOOK_PRICE_LIST_META,
  availablePublicTripTypes,
  computePrice,
  destinationsFor,
  findRoute,
  pickupLocations,
  resolveTripType,
  tripRulesFor,
  workbookOneWayPrice,
  workbookRoundTripPrice,
} from "./data";
import { normalizeReturnFields, isValidReturn, readInitialBookingState } from "./bookingState";
import { newestFeaturedTransfers } from "./journeys";
import {
  SELECTED_TRIPADVISOR_REVIEW_COUNT,
  TRIPADVISOR_LOCATION_ID,
  TRIPADVISOR_PAGE_URL,
  TRIPADVISOR_WIDGETS,
  tripadvisorWidgetScriptUrl,
} from "./tripadvisor";

const xpander = FLEET.find((vehicle) => vehicle.id === "xpander")!;
const corolla = FLEET.find((vehicle) => vehicle.id === "corolla")!;
const hiace = FLEET.find((vehicle) => vehicle.id === "hiace")!;

function price(from: string, to: string, publicTrip: "oneWay" | "roundTrip", vehicle = xpander) {
  const route = findRoute(from, to);
  expect(route).toBeDefined();
  const trip = resolveTripType(route, publicTrip);
  expect(trip).toBeTruthy();
  return computePrice(route!, trip!, vehicle);
}

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

describe("workbook-derived route and pricing model", () => {
  it("keeps the workbook metadata and provisional yellow rows auditable", () => {
    expect(WORKBOOK_PRICE_LIST_META.sourceFile).toBe("LuxRide-Price-List.xlsx");
    expect(WORKBOOK_PRICE_LIST_META.baseVehicle).toBe("MPV One Way");
    expect(WORKBOOK_PRICE_LIST_META).toMatchObject({ sedanRatio: 0.8, miniVanRatio: 1.75, roundTripRatio: 1.8 });
    expect(WORKBOOK_PRICE_LIST_META.sourceRows).toBe(302);
    expect(DRAFT_ROUTE_REFERENCES.length).toBe(WORKBOOK_PRICE_LIST_META.provisionalRows);
    expect(ROUTES.some((route) => route.draftStatus === "provisional")).toBe(true);
    expect(findRoute("Hurghada", "Village Road")?.draftStatus).toBe("provisional");
  });

  it("uses workbook MPV One Way as the base and derives vehicle prices with the workbook ratios", () => {
    const route = findRoute("Hurghada Airport", "El Gouna")!;
    expect(route.mpvOneWay).toBe(21);
    expect(workbookOneWayPrice(route.mpvOneWay!, corolla)).toBe(17);
    expect(workbookOneWayPrice(route.mpvOneWay!, xpander)).toBe(21);
    expect(workbookOneWayPrice(route.mpvOneWay!, hiace)).toBe(37);
    expect(workbookRoundTripPrice(route.mpvOneWay!, corolla)).toBe(31);
    expect(workbookRoundTripPrice(route.mpvOneWay!, xpander)).toBe(38);
    expect(workbookRoundTripPrice(route.mpvOneWay!, hiace)).toBe(67);
  });

  it("computes clean whole-Euro customer prices including unchanged airport and permit fees", () => {
    expect(price("Hurghada Airport", "El Gouna", "oneWay", xpander)).toMatchObject({ base: 21, airport: AIRPORT_SURCHARGE, total: 23 });
    expect(price("Hurghada Airport", "El Gouna", "roundTrip", corolla)).toMatchObject({ base: 31, airport: AIRPORT_SURCHARGE, total: 33 });
    expect(price("Hurghada", "Luxor", "oneWay", xpander)).toMatchObject({ base: 75, permit: 20, total: 95 });
    expect(price("Hurghada", "Luxor", "roundTrip", hiace)).toMatchObject({ base: 236, permit: 30, total: 266 });
  });

  it("supports One Way and Round Trip for every public workbook transfer while keeping Overday/Overnight internal", () => {
    expect(ROUTES.length).toBeGreaterThan(150);
    for (const route of ROUTES) {
      expect(availablePublicTripTypes(route)).toEqual(["oneWay", "roundTrip"]);
      expect(resolveTripType(route, "oneWay")).toBe("oneWay");
      expect(resolveTripType(route, "roundTrip")).toMatch(/overday|overnight/);
    }
  });

  it("automatically classifies Aswan, Alexandria, and Sharm El Sheikh as Overnight returns", () => {
    expect(tripRulesFor(findRoute("Hurghada", "Aswan"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada", "Alexandria"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada", "Sharm El Sheikh"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada", "Luxor"))?.roundTripMode).toBe("overday");
  });

  it("keeps the requested important homepage transfer list concise", () => {
    expect(POPULAR_TRANSFERS.map((transfer) => `${transfer.from} -> ${transfer.to}`)).toEqual([
      "Hurghada Airport -> Hurghada",
      "Hurghada Airport -> Makadi Bay",
      "Hurghada Airport -> El Gouna",
      "Hurghada Airport -> Sahl Hasheesh",
      "Hurghada Airport -> Village Road",
      "Hurghada Airport -> Al Ahyaa",
      "Hurghada -> Luxor",
      "Hurghada -> Cairo",
      "Hurghada -> Marsa Alam",
      "Hurghada -> Wadi El Gemal",
    ]);
  });
});

describe("vehicle and booking validation", () => {
  it("preserves production availability while enabling all vehicles for client review", () => {
    expect(CLIENT_REVIEW_ENABLE_ALL_VEHICLES).toBe(true);
    expect(PRODUCTION_ACTIVE_FLEET.map((vehicle) => vehicle.id)).toEqual(["xpander"]);
    expect(ACTIVE_FLEET.map((vehicle) => vehicle.id)).toEqual(["xpander"]);
    expect(SELECTABLE_FLEET.map((vehicle) => vehicle.id)).toEqual(["corolla", "xpander", "hiace"]);
  });

  it("keeps the approved vehicle passenger and luggage limits and correct image mapping", () => {
    expect(FLEET.map(({ id, pax, luggage, available }) => ({ id, pax, luggage, available }))).toEqual([
      { id: "xpander", pax: 4, luggage: 4, available: true },
      { id: "corolla", pax: 3, luggage: 2, available: false },
      { id: "hiace", pax: 8, luggage: 8, available: false },
    ]);
    const data = readSource("./data.ts");
    expect(data).toContain("../../../assets/vehicles/xpander.webp");
    expect(data).toContain("../../../assets/vehicles/corolla.webp");
    expect(data).toContain("../../../assets/vehicles/hiace.webp");
  });

  it("provides workbook pickup and destination cascades", () => {
    expect(pickupLocations()).toContain("Hurghada Airport");
    expect(destinationsFor("Hurghada Airport")).toEqual(expect.arrayContaining(["Hurghada", "El Gouna", "Village Road", "Al Ahyaa"]));
    expect(destinationsFor("Hurghada")).toEqual(expect.arrayContaining(["Luxor", "Cairo", "Marsa Alam", "Wadi El Gemal"]));
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

  it("validates return fields for automatic Overday and Overnight classifications", () => {
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-10", "18:00")).toBe(true);
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-11", "08:00")).toBe(false);
    expect(isValidReturn("overnight", "2026-08-10", "20:00", "2026-08-11", "07:00")).toBe(true);
    expect(isValidReturn("overnight", "2026-08-10", "08:00", "2026-08-10", "20:00")).toBe(false);
    expect(normalizeReturnFields("overday", "2026-08-10", "", "18:00")).toEqual({ returnDate: "2026-08-10", returnTime: "18:00" });
  });
});

describe("latest desktop client-review integration", () => {
  it("routes Featured Transfers at /featured-transfers and redirects /journeys", () => {
    const routes = readSource("../../routes.tsx");
    expect(routes).toContain('{ path: "featured-transfers", Component: JourneysPage }');
    expect(routes).toContain('{ path: "journeys", element: <Navigate to="/featured-transfers" replace /> }');
  });

  it("keeps homepage sections in the approved order with Featured Transfers in place", () => {
    const home = readSource("../../pages/Home.tsx");
    const components = ["<Hero />", "<LastMinute />", "<HowItWorks />", "<ServiceBenefits />", "<PopularTransfers />", "<FeaturedJourneys />", "<Fleet />", "<WhyChoose />", "<Reviews />", "<FAQ />", "<FinalCTA />"];
    const positions = components.map((component) => home.indexOf(component));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("only exposes One Way and Round Trip in calculator and booking selectors", () => {
    const estimate = readSource("./EstimateYourTrip.tsx");
    const booking = readSource("../../pages/BookingPage.tsx");
    expect(estimate + booking).toContain('id: "roundTrip"');
    expect(estimate + booking).toContain("Route classification:");
    expect(estimate + booking).not.toContain('id: "overday"');
    expect(estimate + booking).not.toContain('id: "overnight"');
  });

  it("renders Featured Transfers as a newest-first horizontal feed with card galleries and hidden visible tags", () => {
    const transfers = newestFeaturedTransfers();
    const featured = readSource("./FeaturedJourneys.tsx");
    const page = readSource("../../pages/JourneysPage.tsx");
    expect(transfers.map((transfer) => transfer.createdAt)).toEqual([...transfers.map((transfer) => transfer.createdAt)].sort().reverse());
    expect(featured + page).toContain("data-featured-transfers-feed=\"horizontal\"");
    expect(featured + page).toContain("data-featured-transfer-gallery=\"true\"");
    expect(featured + page).toContain("data-featured-transfer-description=\"scrollable\"");
    expect(featured + page).toContain("Book Similar Transfer");
    expect(featured + page).toContain("Explore All Transfers");
    expect(featured).not.toContain("journey.tags");
  });

  it("uses the latest Tripadvisor widget IDs and selected 5-review reader option", () => {
    expect(TRIPADVISOR_LOCATION_ID).toBe("34457256");
    expect(SELECTED_TRIPADVISOR_REVIEW_COUNT).toBe(5);
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.uniqueId)).toEqual(["491", "411", "384"]);
    expect(TRIPADVISOR_WIDGETS.map((widget) => widget.containerId)).toEqual([
      "TA_selfserveprop491",
      "TA_cdsratingsonlynarrow411",
      "TA_excellent384",
    ]);
    expect(TRIPADVISOR_WIDGETS.map(tripadvisorWidgetScriptUrl)).toEqual([
      "https://www.jscache.com/wejs?wtype=selfserveprop&uniq=491&locationId=34457256&lang=en_US&rating=true&nreviews=5&writereviewlink=true&popIdx=false&iswide=true&border=true&display_version=2",
      "https://www.jscache.com/wejs?wtype=cdsratingsonlynarrow&uniq=411&locationId=34457256&lang=en_US&border=true&display_version=2",
      "https://www.jscache.com/wejs?wtype=excellent&uniq=384&locationId=34457256&lang=en_US&display_version=2",
    ]);
  });

  it("removes old active Tripadvisor runtime IDs and uses the requested balanced layout", () => {
    const reviews = readSource("./Reviews.tsx");
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));
    expect(TRIPADVISOR_PAGE_URL).toContain("d34457256");
    expect(reviews).toContain('data-tripadvisor-layout="latest-pdf"');
    expect(reviews).toContain("grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]");
    expect(reviews).toContain("items-center justify-center");
    expect(activeCode).not.toMatch(/TA_(cdsratingsonlynarrow470|cdswritereviewnew935|cdsscrollingravenarrow782|selfserveprop489)/);
    expect(activeCode).not.toMatch(/uniq=(470|935|782|489)/);
  });

  it("renders confirmed social links, official email, and safe external attributes", () => {
    const footer = readSource("./Footer.tsx");
    const contact = readSource("../../pages/ContactPage.tsx");
    expect(EMAIL).toBe("booking@luxride-eg.com");
    expect(FACEBOOK_URL).toBe("https://www.facebook.com/luxride.eg/");
    expect(INSTAGRAM_URL).toBe("https://www.instagram.com/luxride.eg/");
    expect(readSource("./data.ts")).toContain('export const EMAIL = "booking@luxride-eg.com"');
    expect(footer).toContain('href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"');
    expect(footer).toContain('href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer"');
    expect(footer + contact).toContain("SocialLogoCircle");
  });

  it("removes visible old transport terminology and LuxRide Egypt branding from active app code", () => {
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));
    expect(activeCode).not.toContain("LuxRide Egypt");
    expect(activeCode).not.toContain("تحويلات");
    expect(activeCode).not.toContain("Explore All Journeys");
    expect(activeCode).not.toContain("Book Similar Trip");
    expect(activeCode).not.toContain("never calculates Round Trip by doubling");
    expect(activeCode).not.toContain("لا تحسب الذهاب والعودة أبداً بمضاعفة");
  });
});
