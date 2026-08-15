const baseUrl = (process.argv[2] || "https://luxride-eg.com").replace(/\/$/, "");

function futureDate(days = 7) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const outboundDate = futureDate(9);
const outbound = `${outboundDate} 13:30`;
const idempotencyKey = `phase2-${Date.now()}`;
const quoteInput = {
  pickup: "Hurghada Airport",
  destination: "Wadi Lahmy",
  trip_type: "one_way",
  vehicle: "mpv",
  passengers: 2,
  bags: 2,
  outbound_datetime: outbound,
  child_seat: true,
};

const quote = await postJson("/wp-json/luxride/v1/quote", quoteInput);
assert(quote.response.ok, `Quote failed: ${JSON.stringify(quote.payload)}`);
assert(Number(quote.payload.pricing.total) > 1, "Quote total should be greater than the tampered client total.");
assert(quote.payload.pricing.child_seat?.price === 0, "Child seat must remain free.");

const booking = await postJson("/wp-json/luxride/v1/bookings", {
  ...quoteInput,
  total: 1,
  review_total: quote.payload.pricing.total,
  idempotency_key: idempotencyKey,
  language: "EN",
  customer: {
    full_name: "Phase Two Verification",
    phone: "+201000000000",
    email: "booking@luxride-eg.com",
  },
  details: {
    exact_location: "Automated verification hotel",
    room_number: "QA",
    flight_number: "QA123",
    notes: "Automated Phase 2.2 verification booking. Client total was intentionally set to 1.",
    child_seat: true,
  },
});

assert(booking.response.status === 201, `Booking failed: ${JSON.stringify(booking.payload)}`);
assert(/^LXR-\d{8}-[A-Z0-9]{4}$/.test(booking.payload.booking.reference), "Booking reference format is invalid.");
assert(Number(booking.payload.booking.final_total_eur) === Number(quote.payload.pricing.total), "Server must store the real quote total, not client total=1.");

const replay = await postJson("/wp-json/luxride/v1/bookings", {
  ...quoteInput,
  total: 1,
  review_total: quote.payload.pricing.total,
  idempotency_key: idempotencyKey,
  language: "EN",
  customer: {
    full_name: "Phase Two Verification",
    phone: "+201000000000",
    email: "booking@luxride-eg.com",
  },
  details: { exact_location: "Automated verification hotel", flight_number: "QA123", child_seat: true },
});

assert(replay.response.ok, `Idempotency replay failed: ${JSON.stringify(replay.payload)}`);
assert(replay.payload.idempotent_replay === true, "Second submit should return the existing booking.");
assert(replay.payload.booking.reference === booking.payload.booking.reference, "Idempotency replay returned a different booking.");

const changed = await postJson("/wp-json/luxride/v1/bookings", {
  ...quoteInput,
  review_total: 1,
  idempotency_key: `phase2-price-change-${Date.now()}`,
  language: "EN",
  customer: {
    full_name: "Phase Two Price Change",
    phone: "+201000000001",
    email: "booking@luxride-eg.com",
  },
  details: { exact_location: "Automated verification hotel", flight_number: "QA123" },
});

assert(changed.response.status === 409, "Mismatched review_total should trigger price_changed.");
assert(changed.payload.code === "price_changed", `Expected price_changed, got ${JSON.stringify(changed.payload)}`);

console.log(JSON.stringify({
  ok: true,
  baseUrl,
  reference: booking.payload.booking.reference,
  storedTotal: booking.payload.booking.final_total_eur,
  tamperedClientTotal: 1,
  idempotentReplay: replay.payload.idempotent_replay,
  priceChangedCode: changed.payload.code,
}, null, 2));
