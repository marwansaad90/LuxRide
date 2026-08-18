import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ACTIVE_FLEET,
  AIRPORT_SURCHARGE,
  ABOUT_IMAGE_SOURCE_FILE,
  CLIENT_REVIEW_ENABLE_ALL_VEHICLES,
  DESTINATION_IMAGE_SOURCE_FILES,
  DRAFT_ROUTE_REFERENCES,
  EMAIL,
  FACEBOOK_URL,
  FLEET,
  IMAGES,
  INSTAGRAM_URL,
  POPULAR_TRANSFERS,
  PRODUCTION_ACTIVE_FLEET,
  ROUTES,
  SELECTABLE_FLEET,
  SUPERSEDED_SOURCE_IMAGE_FILES,
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
import { WORKBOOK_PRICE_LIST_ROWS } from "./workbookRoutes";
import { normalizeReturnFields, isValidReturn, readInitialBookingState } from "./bookingState";
import { normalizeLuxRideContent } from "./cms";
import { newestFeaturedTransfers } from "./journeys";
import { PUBLIC_SEO_ROUTES } from "./seo";
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

function assetSize(relativePath: string): number {
  return statSync(new URL(relativePath, import.meta.url)).size;
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
    expect(WORKBOOK_PRICE_LIST_META.sourceFile).toBe("LuxRide-Pricelist.xlsx");
    expect(WORKBOOK_PRICE_LIST_META.vehiclePricing).toBe("exact_workbook_values");
    expect(WORKBOOK_PRICE_LIST_META.sourceRows).toBe(320);
    expect(WORKBOOK_PRICE_LIST_META.confirmedRows).toBe(320);
    expect(WORKBOOK_PRICE_LIST_META.provisionalRows).toBe(0);
    expect(DRAFT_ROUTE_REFERENCES.length).toBe(WORKBOOK_PRICE_LIST_META.provisionalRows);
    expect(ROUTES.some((route) => route.draftStatus === "provisional")).toBe(false);
    expect(findRoute("Hurghada City Center", "Village Road")?.draftStatus).toBe("confirmed");
  });

  it("uses exact workbook prices for each vehicle without ratio derivation", () => {
    const workbookRow = WORKBOOK_PRICE_LIST_ROWS.find((row) => row.pickup === "Hurghada Airport" && row.destination === "El Gouna")!;
    const route = findRoute("Hurghada Airport", "El Gouna")!;
    expect(route.vehiclePrices.corolla).toMatchObject({ oneWay: 17, overday: 31 });
    expect(route.vehiclePrices.xpander).toMatchObject({ oneWay: 21, overday: 38 });
    expect(route.vehiclePrices.hiace).toMatchObject({ oneWay: 37, overday: 67 });
    expect(workbookOneWayPrice(workbookRow, corolla)).toBe(17);
    expect(workbookOneWayPrice(workbookRow, xpander)).toBe(21);
    expect(workbookOneWayPrice(workbookRow, hiace)).toBe(37);
    expect(workbookRoundTripPrice(workbookRow, corolla)).toBe(31);
    expect(workbookRoundTripPrice(workbookRow, xpander)).toBe(38);
    expect(workbookRoundTripPrice(workbookRow, hiace)).toBe(67);
  });

  it("computes clean whole-Euro customer prices including unchanged airport and permit fees", () => {
    expect(price("Hurghada Airport", "El Gouna", "oneWay", xpander)).toMatchObject({ base: 21, airport: AIRPORT_SURCHARGE, total: 23 });
    expect(price("Hurghada City Center", "Hurghada Airport", "oneWay", xpander)).toMatchObject({ base: 13, airport: AIRPORT_SURCHARGE, total: 15 });
    expect(price("Hurghada Airport", "El Gouna", "roundTrip", corolla)).toMatchObject({ base: 31, airport: AIRPORT_SURCHARGE, total: 33 });
    expect(price("Hurghada City Center", "Luxor", "oneWay", xpander)).toMatchObject({ base: 75, permit: 20, total: 95 });
    expect(price("Hurghada City Center", "Luxor", "roundTrip", hiace)).toMatchObject({ base: 236, permit: 30, total: 266 });
  });

  it("keeps the verified Hurghada Airport to Hurghada sedan example unchanged", () => {
    expect(price("Hurghada Airport", "Hurghada City Center", "oneWay", corolla)).toMatchObject({
      base: 10,
      airport: AIRPORT_SURCHARGE,
      total: 12,
    });
    expect(price("Hurghada Airport", "Hurghada City Center", "roundTrip", corolla)).toMatchObject({
      base: 18,
      airport: AIRPORT_SURCHARGE,
      total: 20,
    });
  });

  it("supports One Way and Round Trip for every public workbook transfer while keeping Overday/Overnight internal", () => {
    expect(ROUTES.length).toBe(320);
    for (const route of ROUTES) {
      expect(availablePublicTripTypes(route)).toEqual(["oneWay", "roundTrip"]);
      expect(resolveTripType(route, "oneWay")).toBe("oneWay");
      expect(resolveTripType(route, "roundTrip")).toMatch(/overday|overnight/);
    }
  });

  it("automatically classifies Aswan, Alexandria, and Sharm El Sheikh as Overnight returns", () => {
    expect(tripRulesFor(findRoute("Hurghada City Center", "Aswan"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada City Center", "Alexandria"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada City Center", "Sharm El Sheikh"))?.roundTripMode).toBe("overnight");
    expect(tripRulesFor(findRoute("Hurghada City Center", "Luxor"))?.roundTripMode).toBe("overday");
  });

  it("keeps the requested important homepage transfer list concise", () => {
    expect(POPULAR_TRANSFERS.map((transfer) => `${transfer.from} -> ${transfer.to}`)).toEqual([
      "Hurghada City Center -> Hurghada Airport",
      "Hurghada Airport -> Hurghada City Center",
      "Hurghada Airport -> Makadi Bay",
      "Hurghada Airport -> El Gouna",
      "Hurghada Airport -> Sahl Hasheesh",
      "Hurghada Airport -> Village Road",
      "Hurghada Airport -> Al Ahyaa Subdivisions",
      "Hurghada City Center -> Luxor",
      "Hurghada City Center -> Cairo",
      "Hurghada City Center -> Marsa Alam",
      "Hurghada City Center -> Wadi El Gemal",
    ]);
    expect(POPULAR_TRANSFERS[0]).toMatchObject({
      id: "hurghada-city-airport",
      from: "Hurghada City Center",
      to: "Hurghada Airport",
      fromPrice: 13,
      airport: true,
    });
  });

  it("normalizes legacy curated CMS route labels to valid calculator routes", () => {
    const content = normalizeLuxRideContent({
      vehicles: SELECTABLE_FLEET,
      popularTransfers: [{
        id: "airport-hurghada",
        from: "Hurghada Airport",
        to: "Hurghada",
        image: IMAGES.hurghada,
        duration: "20 min",
        fromPrice: 13,
        airport: true,
        permit: false,
        displayFrom: { EN: "", AR: "" },
        displayOrder: 1,
        contexts: ["popular"],
      }, {
        id: "hurghada-city-airport",
        from: "Hurghada",
        to: "Hurghada Airport",
        image: IMAGES.cityAirportTransfer,
        duration: "20 min",
        fromPrice: 13,
        airport: true,
        permit: false,
        displayOrder: 99,
        contexts: ["popular"],
      }],
      destinationGroups: [{
        en: "Hurghada area transfers",
        ar: "توصيلات منطقة الغردقة",
        routes: [{
          id: "hurghada-ahyaa",
          from: "Hurghada",
          to: "Al Ahyaa",
          image: IMAGES.alAhyaa,
          duration: "on request",
          fromPrice: 15,
          airport: false,
          permit: false,
          displayOrder: 1,
          contexts: ["destination"],
        }],
      }],
      experiences: newestFeaturedTransfers(),
      faqs: [{
        id: "home-1",
        context: "home",
        q: { EN: "Question", AR: "سؤال" },
        a: { EN: "Answer", AR: "إجابة" },
        displayOrder: 1,
      }],
    });

    expect(content?.popularTransfers[0]).toMatchObject({
      id: "hurghada-city-airport",
      from: "Hurghada City Center",
      to: "Hurghada Airport",
      displayFrom: { EN: "Hurghada", AR: "الغردقة" },
    });
    expect(findRoute(content!.popularTransfers[0].from, content!.popularTransfers[0].to)).toBeDefined();
    expect(content?.popularTransfers[1].displayFrom).toBeUndefined();
    expect(content?.popularTransfers[1].displayTo).toEqual({ EN: "Hurghada", AR: "الغردقة" });
    expect(content?.destinationGroups[0].routes[0]).toMatchObject({
      from: "Hurghada City Center",
      to: "Al Ahyaa Subdivisions",
      displayFrom: { EN: "Hurghada", AR: "الغردقة" },
      displayTo: { EN: "Al Ahyaa", AR: "الأحياء" },
    });
    expect(findRoute(content!.destinationGroups[0].routes[0].from, content!.destinationGroups[0].routes[0].to)).toBeDefined();
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
    expect(corolla.name).toBe("Toyota Corolla");
    expect(hiace.name).toBe("Toyota HiAce");
    expect(xpander.name).toBe("Mitsubishi Xpander 2027");
    const data = readSource("./data.ts");
    expect(data).toContain("../../../assets/vehicles/xpander.webp");
    expect(data).toContain("../../../assets/vehicles/corolla.webp");
    expect(data).toContain("../../../assets/vehicles/hiace.webp");
    expect(assetSize("../../../assets/vehicles/xpander.webp")).toBe(47920);
    expect(assetSize("../../../assets/vehicles/corolla.webp")).toBe(38064);
    expect(assetSize("../../../assets/vehicles/hiace.webp")).toBe(33820);
  });

  it("uses client-approved customer-facing vehicle card copy without removed terms", () => {
    expect(xpander).toMatchObject({
      category: "MPV",
      categoryAr: "MPV",
      tagline: "Ideal for families and small groups",
      taglineAr: "مثالية للعائلات والمجموعات الصغيرة",
    });
    expect(corolla).toMatchObject({
      tagline: "Comfortable private car for couples and solo travellers",
      taglineAr: "سيارة مريحة للأزواج والمسافرين بمفردهم",
    });
    expect(hiace).toMatchObject({
      tagline: "For larger groups and extra luggage",
      taglineAr: "للمجموعات الأكبر والأمتعة الإضافية",
    });
    const fleetCopy = JSON.stringify(FLEET.map(({ category, categoryAr, tagline, taglineAr }) => ({ category, categoryAr, tagline, taglineAr })));
    expect(fleetCopy).toContain("MPV");
    expect(fleetCopy).not.toContain("Family");
    expect(fleetCopy).not.toContain("سيارة عائلية");
    expect(fleetCopy).not.toContain("مكيفة");
    expect(fleetCopy).not.toContain("تنفيذية");
    expect(fleetCopy).not.toContain("رحبة");
  });

  it("provides workbook pickup and destination cascades", () => {
    expect(pickupLocations()).toContain("Hurghada Airport");
    expect(destinationsFor("Hurghada Airport")).toEqual(expect.arrayContaining(["Hurghada City Center", "El Gouna", "Village Road", "Al Ahyaa Subdivisions", "Wadi Lahmy"]));
    expect(destinationsFor("Hurghada City Center")).toEqual(expect.arrayContaining(["Luxor", "Cairo", "Marsa Alam", "Wadi El Gemal", "Wadi Lahmy"]));
  });

  it("uses valid, distinct imagery for major long-distance destination cards", () => {
    expect(findRoute("Hurghada City Center", "Luxor")?.image).toBe(IMAGES.luxor);
    expect(findRoute("Hurghada City Center", "Aswan")?.image).toBe(IMAGES.aswan);
    expect(findRoute("Hurghada City Center", "Cairo")?.image).toBe(IMAGES.cairo);
    expect(findRoute("Hurghada City Center", "Alexandria")?.image).toBe(IMAGES.alexandria);
    expect(findRoute("Hurghada City Center", "Sharm El Sheikh")?.image).toBe(IMAGES.sharm);
    expect(findRoute("Hurghada Airport", "Hurghada City Center")?.image).toBe(IMAGES.hurghada);
    expect(findRoute("Hurghada City Center", "Hurghada Airport")?.image).toBe(IMAGES.cityAirportTransfer);
    expect(IMAGES.airport).toContain("hurghada-airport-transfer.webp");
    expect(IMAGES.cityAirportTransfer).toContain("Airport-16to9.jpg");
    expect(IMAGES.hurghada).toContain("Hurghada-16to9.jpg");
    expect(IMAGES.sahlHasheesh).toContain("sahl-hasheesh-client.jpg");
    expect(IMAGES.luxor).toContain("luxor-private-transfer.webp");
    expect(IMAGES.aswan).toContain("aswan-private-transfer.webp");
    expect(IMAGES.cairo).toContain("cairo-pyramids-transfer.webp");
    expect(IMAGES.villageRoad).toContain("village-road-transfer.webp");
    expect(IMAGES.wadiElGemal).toContain("wadi-el-gemal-transfer.webp");
    expect(IMAGES.sharm).toContain("Sharm_El_Sheikh._Naama_Bay..jpg");
    expect(new Set([IMAGES.luxor, IMAGES.aswan, IMAGES.cairo, IMAGES.alexandria, IMAGES.sharm]).size).toBe(5);
    expect(assetSize("../../../assets/destinations/Airport-16to9.jpg")).toBeLessThan(200_000);
    expect(assetSize("../../../assets/destinations/Hurghada-16to9.jpg")).toBeLessThan(500_000);
    expect(assetSize("../../../assets/destinations/sahl-hasheesh-client.jpg")).toBeLessThan(500_000);
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
      from: "",
      to: "",
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

  it("starts blank without route params and preserves valid deep-linked routes", () => {
    expect(readInitialBookingState(new URLSearchParams())).toMatchObject({
      from: "",
      to: "",
      publicTrip: "oneWay",
      corrected: false,
    });

    const deepLink = readInitialBookingState(new URLSearchParams({
      from: "Hurghada Airport",
      to: "El Gouna",
      trip: "roundTrip",
    }));
    expect(deepLink).toMatchObject({
      from: "Hurghada Airport",
      to: "El Gouna",
      publicTrip: "roundTrip",
      corrected: false,
    });
  });

  it("validates return fields for automatic Overday and Overnight classifications", () => {
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-10", "18:00")).toBe(true);
    expect(isValidReturn("overday", "2026-08-10", "08:00", "2026-08-11", "08:00")).toBe(false);
    expect(isValidReturn("overnight", "2026-08-10", "20:00", "2026-08-11", "07:00")).toBe(true);
    expect(isValidReturn("overnight", "2026-08-10", "08:00", "2026-08-10", "20:00")).toBe(false);
    expect(normalizeReturnFields("overday", "2026-08-10", "", "18:00")).toEqual({ returnDate: "2026-08-10", returnTime: "18:00" });
  });

  it("keeps the verified Alexandria overnight examples derived from workbook values", () => {
    const oneNight = price("Hurghada Airport", "Alexandria", "roundTrip", corolla);
    expect(oneNight).toMatchObject({
      base: 385,
      airport: AIRPORT_SURCHARGE,
      overnight: 42,
      total: 429,
    });
    expect(oneNight!.total + 42).toBe(471);
    expect(oneNight!.total + 84).toBe(513);
  });
});

describe("latest desktop client-review integration", () => {
  it("routes Unforgettable Experiences at /experiences and redirects legacy URLs", () => {
    const routes = readSource("../../routes.tsx");
    expect(routes).toContain('{ path: "experiences", Component: JourneysPage }');
    expect(routes).toContain('{ path: "featured-transfers", element: <Navigate to="/experiences" replace /> }');
    expect(routes).toContain('{ path: "journeys", element: <Navigate to="/experiences" replace /> }');
  });

  it("uses the shared branded inner-page header on client-requested pages", () => {
    expect(readSource("../../pages/AboutPage.tsx")).toContain('tone="brand"');
    expect(readSource("../../pages/FAQPage.tsx")).toContain('tone="brand"');
    expect(readSource("../../pages/FleetPage.tsx")).toContain('tone="brand"');
    expect(readSource("../../pages/BookingPage.tsx")).toContain('tone="brand"');
    const pageShell = readSource("./PageShell.tsx");
    expect(pageShell).toContain("bg-[#F6EFE6]");
    expect(pageShell).toContain("radial-gradient(circle_at_top_left");
  });

  it("keeps homepage sections in the approved order with Unforgettable Experiences in place", () => {
    const home = readSource("../../pages/Home.tsx");
    const components = ["<Hero />", "<LastMinute />", "<HowItWorks />", "<ServiceBenefits />", "<PopularTransfers />", "<FeaturedJourneys />", "<Fleet />", "<WhyChoose />", "<Reviews />", "<FAQ />", "<FinalCTA />"];
    const positions = components.map((component) => home.indexOf(component));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("only exposes One Way and Round Trip in calculator and booking selectors", () => {
    const estimate = readSource("./EstimateYourTrip.tsx");
    const booking = readSource("../../pages/BookingPage.tsx");
    const success = readSource("../../pages/BookingSuccessPage.tsx");
    const transferDetails = readSource("../../pages/TransferDetailsPage.tsx");
    const destinations = readSource("../../pages/DestinationsPage.tsx");
    expect(estimate + booking).toContain('id: "roundTrip"');
    expect(estimate + booking + success + transferDetails + destinations).not.toContain("Route classification");
    expect(estimate + booking + success + transferDetails + destinations).not.toContain("تصنيف المسار");
    expect(estimate + booking).not.toContain('id: "overday"');
    expect(estimate + booking).not.toContain('id: "overnight"');
  });

  it("guards the final booking UX closeout copy and validation behavior", () => {
    const booking = readSource("../../pages/BookingPage.tsx");
    const translations = readSource("./i18n.ts");
    const selector = readSource("./VehicleSegmentedSelector.tsx");
    const seed = readSource("../../../../wordpress/wp-content/themes/luxride/inc/seed-data.php");

    expect(booking).toContain("Base transfer estimate");
    expect(booking).toContain("calculated after return date");
    expect(booking).toContain("Please select a pickup time.");
    expect(booking).toContain("يرجى اختيار وقت الانطلاق.");
    expect(booking).toContain("Hotel name or exact destination");
    expect(booking).toContain("e.g. Hotel name or exact address");
    expect(booking).toContain("Search pickup location");
    expect(booking).toContain("Search destination");
    expect(booking).toContain("Email Address (optional)");
    expect(booking).not.toContain("Email Address *");
    expect(booking).not.toContain("Pax / Bags");
    expect(booking).not.toContain("shadow-md shadow-lux-green/25");
    expect(booking).not.toContain("shadow-lg shadow-lux-green/30");
    const success = readSource("../../pages/BookingSuccessPage.tsx");
    expect(success).toContain('tone="brand"');
    expect(success).toContain("Your request is saved in the LuxRide booking dashboard");
    expect(success).toContain("booking.bookingReference");
    expect(success).toContain("Follow up on WhatsApp");
    expect(success).toContain('L("Passengers", "الركاب")');
    expect(success).toContain('L("Bags", "الحقائب")');
    expect(success).not.toContain("Passengers / bags");
    expect(booking).toContain("Driver Accommodation");
    expect(booking).toContain("nightLabel");
    expect(booking).toContain("requestQuote(false)");
    expect(booking + translations).not.toContain("Steigenberger Al Dau, El Gouna");
    expect(booking + translations).not.toContain("شتيجنبرجر الداو، الجونة");
    expect(selector).toContain('xpander: { en: "MPV", ar: "MPV"');
    expect(selector).toContain('model: "Mitsubishi Xpander 2027"');
    expect(seed).toContain("'luxride_vehicle_type' => 'MPV'");
    expect(seed).toContain("'luxride_summary_ar' => 'مثالية للعائلات والمجموعات الصغيرة'");
    expect(seed).not.toContain("'luxride_vehicle_type' => 'Family Car'");
  });

  it("renders Unforgettable Experiences as a newest-first horizontal feed with card galleries and hidden visible tags", () => {
    const transfers = newestFeaturedTransfers();
    const featured = readSource("./FeaturedJourneys.tsx");
    const page = readSource("../../pages/JourneysPage.tsx");
    expect(transfers.map((transfer) => transfer.createdAt)).toEqual([...transfers.map((transfer) => transfer.createdAt)].sort().reverse());
    expect(featured + page).toContain("data-experiences-feed=\"horizontal\"");
    expect(featured + page).toContain("data-featured-transfer-gallery=\"true\"");
    expect(featured + page).toContain("data-experience-description=\"scrollable\"");
    expect(featured + page).toContain("Book Similar Transfer");
    expect(featured + page).toContain("Explore All Experiences");
    expect(featured).not.toContain("bg-gradient-to-l");
    expect(featured).not.toContain("bg-gradient-to-r");
    expect(page).toContain("Explore more experiences");
    expect(page).not.toContain("Scroll horizontally to see older transfers");
    expect(page).not.toContain("More featured transfers can be added once final images and content are approved");
    expect(featured).not.toContain("journey.tags");
    expect(featured).toContain("objectPosition: journey.imagePosition");
  });

  it("keeps Luxor as the first experience with the five supplied LuxRide gallery images", () => {
    const [first] = newestFeaturedTransfers();
    const journeySource = readSource("./journeys.ts");
    expect(first.id).toBe("hurghada-luxor-unforgettable-day-trip");
    expect(first.title.EN).toBe("A Featured Journey: An Unforgettable Day Trip to Luxor");
    expect(first.booking).toEqual({ from: "Hurghada City Center", to: "Luxor", trip: "roundTrip" });
    expect(first.images).toHaveLength(5);
    expect(first.images.map((image) => image.match(/luxor-day-trip-\d/)?.[0])).toEqual([
      "luxor-day-trip-3",
      "luxor-day-trip-1",
      "luxor-day-trip-5",
      "luxor-day-trip-2",
      "luxor-day-trip-4",
    ]);
    expect(first.images).not.toContain(IMAGES.luxor);
    expect(first.images).not.toContain(IMAGES.luxorDetail);
    expect(journeySource).toContain("luxorDayTrip3, luxorDayTrip1, luxorDayTrip5, luxorDayTrip2, luxorDayTrip4");
    expect(first.description.EN).toContain("We’d love to share the story of a recent trip");
  });

  it("replaces the airport El Gouna experience with Porto Ghalib and keeps Sharm to one image", () => {
    const transfers = newestFeaturedTransfers();
    const portoGhalib = transfers.find((transfer) => transfer.id === "hurghada-port-ghalib-marina-overday");
    const sharm = transfers.find((transfer) => transfer.id === "hurghada-sharm-one-way");
    const destinationsPage = readSource("../../pages/DestinationsPage.tsx");
    const journeySource = readSource("./journeys.ts");

    expect(transfers.map((transfer) => transfer.id)).toEqual([
      "hurghada-luxor-unforgettable-day-trip",
      "hurghada-port-ghalib-marina-overday",
      "hurghada-wadi-el-gemal-overday",
      "hurghada-luxor-dendera-overday",
      "hurghada-sharm-one-way",
    ]);
    expect(portoGhalib).toBeDefined();
    expect(portoGhalib?.title.EN).toBe("Marina Escape Transfer: Hurghada to Porto Ghalib");
    expect(portoGhalib?.title.AR).toContain("بورتو غالب");
    expect(portoGhalib?.booking).toEqual({ from: "Hurghada City Center", to: "Porto Ghaleb", trip: "roundTrip" });
    expect(portoGhalib?.images).toHaveLength(1);
    expect(portoGhalib?.imagePosition).toBe("center 72%");
    expect(transfers.find((transfer) => transfer.id === "hurghada-wadi-el-gemal-overday")?.images).toEqual([IMAGES.wadiElGemal]);
    expect(transfers.find((transfer) => transfer.id === "hurghada-luxor-dendera-overday")?.images).toEqual([IMAGES.luxorDetail]);
    expect(sharm?.images).toEqual([IMAGES.sharm]);
    expect(journeySource).toContain("port-ghalib-transfer.jpg");
    expect(journeySource).not.toContain("Airport Arrival Transfer: Hurghada Airport to El Gouna");
    expect(destinationsPage).toContain("useDestinationGroups");
    expect(destinationsPage).toContain("findRoute(destination.from, destination.to)");
    expect(destinationsPage).not.toContain("routeFromApiRoute");
    expect(destinationsPage).not.toContain("data-destinations-route-count");
    expect(destinationsPage).not.toContain("/wp-json/luxride/v1/routes");
    expect(readSource("../../../../wordpress/wp-content/themes/luxride/inc/seed-data.php")).toContain("'Hurghada', 'Hurghada Airport'");
    expect(assetSize("../../../assets/experiences/port-ghalib-transfer.jpg")).toBeLessThan(300_000);
  });

  it("keeps the client-corrected image source mapping auditable", () => {
    expect(ABOUT_IMAGE_SOURCE_FILE).toBe("LuxRide.gif");
    expect(IMAGES.aboutTransfer).toContain("luxride-about-transfer.webp");
    expect(DESTINATION_IMAGE_SOURCE_FILES).toMatchObject({
      airport: "images.jpg",
      hurghadaCityAirportTransfer: "Airport-16to9.jpg",
      hurghada: "Hurghada-16to9.jpg",
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
      wadiElGemal: "Wadi-Elgemal.jpg",
    });
    const [firstTransfer] = POPULAR_TRANSFERS;
    expect(firstTransfer.from).toBe("Hurghada City Center");
    expect(firstTransfer.to).toBe("Hurghada Airport");
    expect(firstTransfer.displayFrom?.EN).toBe("Hurghada City");
    expect(firstTransfer.image).toBe(IMAGES.cityAirportTransfer);
    expect(firstTransfer.image).not.toBe(IMAGES.airport);
    expect(IMAGES.hurghada).toContain("Hurghada-16to9.jpg");
    expect(IMAGES.sahlHasheesh).toContain("sahl-hasheesh-client.jpg");
    expect(IMAGES.villageRoad).toContain("village-road-transfer.webp");
    expect(IMAGES.wadiElGemal).toContain("wadi-el-gemal-transfer.webp");
    const activeMapping = JSON.stringify({ IMAGES, DESTINATION_IMAGE_SOURCE_FILES });
    for (const filename of SUPERSEDED_SOURCE_IMAGE_FILES) {
      expect(activeMapping).not.toContain(filename);
    }
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
    expect(footer).toContain('href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"');
    expect(footer).toContain('href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"');
    expect(contact).toContain('href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"');
    expect(footer + contact).toContain("useSiteSettings");
    expect(footer + contact).toContain("SocialLogoCircle");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-facebook-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-instagram-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-whatsapp-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-phone-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-email-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).toContain("luxride-location-glyph.png");
    expect(readSource("./SocialBrandIcons.tsx")).not.toContain("upload.wikimedia.org");
  });

  it("keeps the latest client visual cleanup source guards in place", () => {
    const header = readSource("./Header.tsx");
    const sections = readSource("./Sections.tsx");
    const hero = readSource("./Hero.tsx");
    const footer = readSource("./Footer.tsx");
    const contact = readSource("../../pages/ContactPage.tsx");
    const fleetPage = readSource("../../pages/FleetPage.tsx");
    const experiencesPage = readSource("../../pages/JourneysPage.tsx");
    expect(header).not.toContain("drop-shadow");
    expect(header).not.toContain("shadow-sm");
    expect(header).not.toContain("shadow-[0_2px_20px");
    expect(sections).toContain('objectPosition: imagePosition');
    expect(sections).not.toContain('center 72%');
    expect(sections).toContain("lg:min-w-[calc((100%_-_2.5rem)_/_3)]");
    expect(sections).toContain('data-homepage-fleet-feed="horizontal"');
    expect(fleetPage).not.toContain('data-homepage-fleet-feed="horizontal"');
    expect(experiencesPage).toContain('data-experiences-page-feed="expanded"');
    expect(experiencesPage).not.toContain('data-experiences-page-feed="horizontal"');
    expect(sections).toContain('spacing="tight"');
    expect(sections).not.toContain("shadow-lux-gold/25");
    expect(hero).not.toContain("shadow-lux-green/25");
    expect(footer).toContain("TripadvisorLogoMark");
    expect(footer).toContain("brightness-0 invert");
    expect(footer).not.toContain("TripadvisorLogoCircle");
    expect(contact).not.toContain("iconZoneClass");
    expect(contact).not.toContain("bg-lux-green/[0.06]");
    expect(contact).toContain("SocialLogoCircle");
    expect(contact).toContain("socialIconFilter");
    expect(footer).toContain("SOCIAL_LOGOS.location");
    expect(footer).toContain("SOCIAL_LOGOS.email");
    expect(footer).toContain("SOCIAL_LOGOS.phone");
  });

  it("uses the latest client yellow accent only on the requested visual refinement targets", () => {
    const brand = readSource("./brand.ts");
    const data = readSource("./data.ts");
    const sections = readSource("./Sections.tsx");
    const fleetPage = readSource("../../pages/FleetPage.tsx");
    const lastMinutePage = readSource("../../pages/LastMinutePage.tsx");
    const hero = readSource("./Hero.tsx");
    const globals = readFileSync(new URL("../../../styles/globals.css", import.meta.url), "utf8");

    expect(brand).toContain('CLIENT_ACCENT_YELLOW = "#ffcc00"');
    expect(brand).toContain('CLIENT_ACCENT_TEXT = "#000000"');
    expect(brand).toContain('CLIENT_STEP_NUMBER_BG = "rgba(255, 204, 0, 0.35)"');
    expect(globals).toContain("--lux-client-accent: #ffcc00");
    expect(sections + fleetPage).toContain("CLIENT_ACCENT_YELLOW");
    expect(sections + fleetPage).toContain("CLIENT_ACCENT_TEXT");
    expect(sections).toContain("CLIENT_STEP_NUMBER_BG");
    expect(sections + fleetPage).toContain('data-fleet-type-badge="client-accent"');
    expect(sections).toContain("hover:border-lux-client-accent");
    expect(data).toContain("IMAGES.sahlHasheesh");
    expect(sections + lastMinutePage).toContain('data-last-minute-accent="button"');
    expect(readSource("./FeaturedJourneys.tsx")).toContain('data-experience-badge="client-accent"');
    expect(sections).toContain('data-last-minute-accent="badge"');
    expect(sections).toContain('data-how-it-works-step-number="client-accent-35"');
    expect(sections + fleetPage).toContain('data-vehicle-card-scroll="y"');
    expect(lastMinutePage).toContain("CLIENT_ACCENT_YELLOW");
    expect(hero).toContain('maxWidth: isAR ? "21ch"');
    expect(hero).toContain('lineHeight: isAR ? 1.16');
    expect(hero).toContain("Elevate Your Journey in Hurghada");
    expect(hero).toContain("ارتقِ بتجربة تنقلك في الغردقة والبحر الأحمر");
  });

  it("removes visible old transport terminology and LuxRide Egypt branding from active app code", () => {
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));
    expect(activeCode).not.toContain("LuxRide Egypt");
    expect(activeCode).not.toContain("تحويلات");
    expect(activeCode).not.toContain("Explore All Journeys");
    expect(activeCode).not.toContain("Book Similar Trip");
    expect(activeCode).not.toContain("Featured Transfers");
    expect(activeCode).toContain("Unforgettable Experiences");
    expect(activeCode).toContain("تجارب لا تُنسى");
    expect(activeCode).not.toContain("never calculates Round Trip by doubling");
    expect(activeCode).not.toContain("لا تحسب الذهاب والعودة أبداً بمضاعفة");
  });

  it("keeps internal review and prototype wording out of public-facing UI copy", () => {
    const activeCode = readActiveAppSources(fileURLToPath(new URL("../../", import.meta.url)));
    const html = readFileSync(new URL("../../../../index.html", import.meta.url), "utf8");
    expect(activeCode + html).not.toContain("for client testing");
    expect(activeCode + html).not.toContain("test mode");
    expect(activeCode + html).not.toContain("review mode");
    expect(activeCode + html).not.toContain("review screen");
    expect(activeCode + html).not.toContain("pending client approval");
    expect(activeCode).not.toContain("workbook-derived");
    expect(activeCode).not.toContain("Workbook-derived");
    expect(html).not.toContain("prototype");
    expect(readSource("../../pages/AboutPage.tsx")).toContain("Sedan, MPV and Mini Van options matched to the passenger and luggage requirements shown during booking");
  });

  it("publishes sitemap and robots for public routes only", () => {
    const sitemap = readFileSync(new URL("../../../../public/sitemap.xml", import.meta.url), "utf8");
    const robots = readFileSync(new URL("../../../../public/robots.txt", import.meta.url), "utf8");
    expect(sitemap).toContain("https://luxdure.pages.dev/experiences");
    expect(sitemap).not.toContain("availability-admin");
    expect(sitemap).not.toContain("validation-states");
    expect(sitemap).not.toContain("featured-transfers");
    expect(sitemap).not.toContain("journeys");
    expect(robots).toContain("Sitemap: https://luxdure.pages.dev/sitemap.xml");
    expect(robots).toContain("Disallow: /availability-admin");
  });

  it("defines unique SEO titles, canonical handling, and structured data support", () => {
    const titles = PUBLIC_SEO_ROUTES.map((route) => route.title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).toContain("Unforgettable Transfer Experiences | LuxRide Taxi");
    const seoSource = readSource("./seo.ts");
    expect(seoSource).toContain('"/featured-transfers": "/experiences"');
    expect(seoSource).toContain('"/journeys": "/experiences"');
    expect(seoSource).toContain('"@type": "LocalBusiness"');
    expect(seoSource).toContain('"@type": "FAQPage"');
    expect(EMAIL).toBe("booking@luxride-eg.com");
  });
});
