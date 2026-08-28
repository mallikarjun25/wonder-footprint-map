import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "app/location-data.json");
const DIRECTORY_URL = "https://www.wonder.com/food-delivery-locations";
const READER_PREFIX = "https://r.jina.ai/http://www.wonder.com";
const TIME_ZONE_BY_STATE = { TX: "America/Chicago" };

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseTime(value) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) throw new Error(`Unsupported time: ${value}`);
  let hour = Number(match[1]) % 12;
  if (match[3].toLowerCase() === "pm") hour += 12;
  return hour * 60 + Number(match[2]);
}

function parseHours(openingHours) {
  const raw = openingHours?.[0] || "";
  const match = raw.match(/^(.+?)\s+(\d{1,2}:\d{2}(?:am|pm))-(\d{1,2}:\d{2}(?:am|pm))$/i);
  if (!match) return {};
  return {
    hoursLabel: `${match[1] === "Sun-Sat" ? "Daily" : match[1]} · ${match[2]}–${match[3]}`,
    opensAt: parseTime(match[2]),
    closesAt: parseTime(match[3]),
  };
}

function parseAddress(address) {
  const normalized = address.replace(/,\s*([A-Z]{2}),\s*(\d{5})$/, ", $1 $2");
  const match = normalized.match(/^(.*),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})$/);
  if (!match) throw new Error(`Could not parse address: ${address}`);
  return { address: normalized, street: match[1], city: match[2], state: match[3], zip: match[4] };
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function geocode(stores, previousBySlug) {
  const resolved = new Map();
  const pending = [];
  for (const store of stores) {
    const old = previousBySlug.get(store.slug);
    if (old?.address === store.address && Number.isFinite(old.latitude) && Number.isFinite(old.longitude)) {
      resolved.set(store.slug, { latitude: old.latitude, longitude: old.longitude, ...(old.coordinatePrecision ? { coordinatePrecision: old.coordinatePrecision } : {}) });
    } else {
      pending.push(store);
    }
  }
  if (!pending.length) return resolved;

  const csv = pending.map((store) => [store.slug, store.street, store.city, store.state, store.zip].map(csvCell).join(",")).join("\n");
  const form = new FormData();
  form.append("addressFile", new Blob([csv], { type: "text/csv" }), "locations.csv");
  form.append("benchmark", "Public_AR_Current");
  const response = await fetch("https://geocoding.geo.census.gov/geocoder/locations/addressbatch", { method: "POST", body: form });
  if (!response.ok) throw new Error(`Census geocoder failed with ${response.status}`);
  const text = await response.text();
  for (const line of text.split(/\r?\n/)) {
    const fields = [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g)].map((m) => (m[1] ?? m[2]).replaceAll('""', '"'));
    if (fields.length < 6 || fields[2] !== "Match") continue;
    const [longitude, latitude] = fields[5].split(",").map(Number);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) resolved.set(fields[0], { latitude, longitude });
  }

  // The Census service does not recognize every retail-style address. Resolve
  // only those misses through OpenStreetMap's public geocoder, at its required
  // one-request-per-second pace.
  for (const store of pending.filter((item) => !resolved.has(item.slug))) {
    const params = new URLSearchParams({ q: store.address, format: "jsonv2", limit: "1", countrycodes: "us" });
    const lookup = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { "User-Agent": "wonder-footprint-map/1.0 (independent portfolio data refresh)" },
    });
    if (lookup.ok) {
      const [match] = await lookup.json();
      const latitude = Number(match?.lat);
      const longitude = Number(match?.lon);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) resolved.set(store.slug, { latitude, longitude });
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1100));
  }
  return resolved;
}

async function fetchReader(path) {
  // A date-scoped URL avoids stale shared-reader cache entries while keeping
  // repeated runs on the same day cache-friendly.
  const refreshKey = new Date().toISOString().slice(0, 10);
  const response = await fetch(`${READER_PREFIX}${path}?portfolio_sync=${refreshKey}`, { headers: { Accept: "text/plain" } });
  if (!response.ok) throw new Error(`Public directory reader failed with ${response.status}`);
  return response.text();
}

async function scrapeViaReader() {
  const markdown = await fetchReader("/food-delivery-locations");
  const cards = [];
  const pattern = /^(?:##\s+)?\[([^\n]+)\]\(https?:\/\/www\.wonder\.com\/food-delivery-locations\/([^)]+)\)$/gm;
  for (const match of markdown.matchAll(pattern)) {
    if (!/Order now|Learn more/.test(match[1])) continue;
    cards.push({ slug: match[2], text: match[1].replaceAll(" ## ", "\n").replaceAll(" ### ", "\n").replace(/^##\s*/, "") });
  }
  return { cards };
}

async function loadSource() {
  const jsonLdPath = argument("--jsonld");
  const cardsPath = argument("--cards");
  if (jsonLdPath && cardsPath) {
    return { jsonLd: await readFile(jsonLdPath, "utf8"), cards: JSON.parse(await readFile(cardsPath, "utf8")) };
  }
  return scrapeViaReader();
}

const source = await loadSource();
const cardBySlug = new Map(source.cards.map((card) => [card.slug, card.text]));
const previous = JSON.parse(await readFile(OUTPUT, "utf8").catch(() => '{"locations":[]}'));
const previousBySlug = new Map(previous.locations.map((location) => [location.slug, location]));

let stores;
if (source.jsonLd) {
  const directory = JSON.parse(source.jsonLd);
  stores = directory.department.map((store) => {
    const slug = new URL(store.url).pathname.split("/").filter(Boolean).pop();
    const cardText = cardBySlug.get(slug) || "";
    const parsed = parseAddress(store.location);
    const plannedMatch = cardText.match(/Coming soon\s*-\s*([^\n]+)/i);
    return { name: store.name, ...parsed, slug, timeZone: TIME_ZONE_BY_STATE[parsed.state] || "America/New_York", status: plannedMatch ? "coming-soon" : cardText.includes("Closed for renovations") ? "renovation" : undefined, plannedFor: plannedMatch?.[1], ...parseHours(store.openingHours) };
  });
} else {
  stores = await Promise.all(source.cards.map(async ({ slug, text }) => {
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const plannedMatch = lines[0]?.match(/^Coming soon\s*-\s*(.+)$/i);
    const renovation = lines[0] === "Closed for renovations";
    const offset = plannedMatch || renovation ? 1 : 0;
    const name = lines[offset];
    const address = lines[offset + 1];
    const parsed = parseAddress(address);
    const old = previousBySlug.get(slug);
    let hours = old ? { hoursLabel: old.hoursLabel, opensAt: old.opensAt, closesAt: old.closesAt } : {};
    if (!plannedMatch && (!old || old.status === "coming-soon" || !old.hoursLabel)) {
      const detail = await fetchReader(`/food-delivery-locations/${slug}`);
      const hoursMatch = detail.match(/\nHOURS\s*\n\s*([^\n]+)/i);
      if (hoursMatch) hours = parseHours([hoursMatch[1].trim()]);
    }
    return { name, ...parsed, slug, timeZone: TIME_ZONE_BY_STATE[parsed.state] || "America/New_York", status: plannedMatch ? "coming-soon" : renovation ? "renovation" : undefined, plannedFor: plannedMatch?.[1], ...hours };
  }));
}

if (stores.length < 150 || stores.length !== cardBySlug.size) {
  throw new Error(`Directory validation failed: ${stores.length} stores and ${cardBySlug.size} cards`);
}

const coordinates = await geocode(stores, previousBySlug);
const { default: zipcodes } = await import("zipcodes");
for (const store of stores.filter((item) => !coordinates.has(item.slug))) {
  const fallback = zipcodes.lookup(store.zip);
  if (fallback) coordinates.set(store.slug, { latitude: fallback.latitude, longitude: fallback.longitude, coordinatePrecision: "zip" });
}
const missing = stores.filter((store) => !coordinates.has(store.slug));
if (missing.length) throw new Error(`No geocode available for: ${missing.map((store) => store.slug).join(", ")}`);

const locations = stores.map((store) => {
  const point = coordinates.get(store.slug);
  const zipCenter = zipcodes.lookup(store.zip);
  const usesZipCenter = zipCenter && point.latitude === zipCenter.latitude && point.longitude === zipCenter.longitude;
  return { ...store, ...point, ...(usesZipCenter ? { coordinatePrecision: "zip" } : {}) };
});
const payload = {
  source: DIRECTORY_URL,
  updatedAt: new Date().toISOString(),
  locations,
};
await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Updated ${basename(OUTPUT)} with ${locations.length} locations.`);
