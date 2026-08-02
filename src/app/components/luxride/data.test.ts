import { describe, expect, it } from "vitest";
import {
  ACTIVE_FLEET,
  AIRPORT_SURCHARGE,
  CLIENT_REVIEW_ENABLE_ALL_VEHICLES,
  FLEET,
  PERMIT_FEE,
  PRODUCTION_ACTIVE_FLEET,
  SELECTABLE_FLEET,
  availableTripTypes,
  computePrice,
  destinationsFor,
  findRoute,
} from "./data";
import { normalizeReturnFields, isValidReturn, readInitialBookingState } from "./bookingState";

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

  it("keeps discount, subtotal, fees, and final total separate", () => {
    const result = price("Hurghada", "Luxor", "oneWay")!;
    expect(result).toMatchObject({
      base: 75,
      discount: 11.25,
      subtotal: 63.75,
      airport: 0,
      permit: 20,
      overnight: 0,
      total: 83.75,
    });
  });

  it("does not guess a price for an unsupported trip type", () => {
    expect(price("Hurghada Airport", "El Gouna", "overday")).toBeNull();
    expect(availableTripTypes(findRoute("Hurghada Airport", "El Gouna"))).toEqual(["oneWay"]);
  });

  it("does not add driver accommodation without a confirmed route rule", () => {
    expect(price("Hurghada", "Sharm El Sheikh", "overnight")?.overnight).toBe(0);
  });
});

describe("vehicle and route validation", () => {
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
