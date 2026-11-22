import "server-only";
import { cacheLife } from "next/cache";
import { apiGet, asRecord } from "./catalog";
import {
  completeStoreInfo,
  FALLBACK_STORE,
  FALLBACK_STORE_INFO,
  type StoreClosure,
  type StoreDay,
  type StoreInfo,
  type StoreStatus,
  WEEKDAYS,
} from "./site";

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finite(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** "09:00" -> 540; anything else -> null. */
function minutes(value: unknown): number | null {
  const match = typeof value === "string" ? /^(\d{1,2}):(\d{2})/.exec(value) : null;
  if (!match) return null;
  const total = Number(match[1]) * 60 + Number(match[2]);
  return total >= 0 && total <= 24 * 60 ? total : null;
}

/**
 * API schedule (day 1 = Monday … 7 = Sunday) to StoreDay[], Monday first.
 * Returns null unless all seven days are present and readable, so a partly
 * configured schedule falls back as a whole instead of showing gaps.
 */
function parseSchedule(value: unknown): StoreDay[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const byDay = new Map<number, StoreDay>();
  for (const item of value) {
    const record = asRecord(item);
    const dayNumber = finite(record?.day);
    if (!dayNumber || dayNumber < 1 || dayNumber > 7) continue;
    const { day, weekday } = WEEKDAYS[dayNumber - 1];

    if (record?.is_closed === true) {
      byDay.set(dayNumber, { day, weekday, closed: true });
      continue;
    }
    const opensAt = minutes(record?.opens_at);
    const closesAt = minutes(record?.closes_at);
    if (opensAt === null || closesAt === null || closesAt <= opensAt) continue;
    byDay.set(dayNumber, { day, weekday, opensAt, closesAt });
  }

  if (byDay.size !== 7) {
    console.error("Store schedule from the API is incomplete; using the fallback hours.");
    return null;
  }
  return Array.from({ length: 7 }, (_, index) => byDay.get(index + 1)!);
}

function parseClosures(value: unknown): StoreClosure[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const record = asRecord(item);
    const date = text(record?.date);
    return date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? [{ date, reason: text(record?.reason) }] : [];
  });
}

function parseStatus(value: unknown): StoreStatus | null {
  const record = asRecord(value);
  if (!record || typeof record.is_open !== "boolean") return null;
  return {
    isOpen: record.is_open,
    closesAt: text(record.closes_at),
    nextOpenAt: text(record.next_open_at),
  };
}

function toStoreInfo(data: Record<string, unknown>): StoreInfo {
  const address = asRecord(data.address);
  const name = text(data.name);
  const street = text(address?.street);
  const city = text(address?.city);
  const schedule = parseSchedule(data.schedule);
  const whatsapp = text(data.whatsapp)?.replace(/\D/g, "") || FALLBACK_STORE.whatsapp;

  return completeStoreInfo({
    name: name ?? FALLBACK_STORE.name,
    whatsapp,
    email: text(data.email) ?? FALLBACK_STORE.email,
    mapsUrl: text(data.maps_url) ?? FALLBACK_STORE.mapsUrl,
    landmark: text(address?.landmark) ?? FALLBACK_STORE.landmark,
    streetAddress: street ?? FALLBACK_STORE.streetAddress,
    // "Jl. X No. 7, Kel. Y, Kec. Z" -> "Jl. X No. 7, Kota"
    shortAddress:
      street || city
        ? [street?.split(",")[0] ?? FALLBACK_STORE.streetAddress.split(",")[0], city ?? FALLBACK_STORE.locality].join(", ")
        : FALLBACK_STORE.shortAddress,
    locality: city ?? FALLBACK_STORE.locality,
    region: text(address?.province) ?? FALLBACK_STORE.region,
    postalCode: text(address?.postal_code) ?? FALLBACK_STORE.postalCode,
    country: text(address?.country) ?? FALLBACK_STORE.country,
    latitude: finite(data.latitude) ?? FALLBACK_STORE.latitude,
    longitude: finite(data.longitude) ?? FALLBACK_STORE.longitude,
    timezone: text(data.timezone) ?? FALLBACK_STORE.timezone,
    schedule: schedule ?? [...FALLBACK_STORE.schedule],
    closures: parseClosures(data.closures),
    // The API status describes the API schedule; with fallback hours it
    // would contradict what the page shows, so drop it.
    status: schedule ? parseStatus(data.status) : null,
  });
}

async function fetchStoreInfo(): Promise<StoreInfo> {
  "use cache";
  cacheLife("minutes");

  const data = asRecord((await apiGet("/store/public"))?.data);
  if (!data) throw new Error("invalidPayload");
  return toStoreInfo(data);
}

/**
 * Store name, contacts, address and hours. Every field falls back to
 * `src/lib/site.ts`, and an unreachable API returns the fallbacks, so callers
 * never need an error branch.
 */
export async function getStoreInfo(): Promise<StoreInfo> {
  try {
    return await fetchStoreInfo();
  } catch {
    return FALLBACK_STORE_INFO;
  }
}
