// Client-safe store helpers and fallback values. Live store data comes from
// `getStoreInfo()` in `src/lib/store.ts` (server only); every field there
// falls back to the values in this file when the API leaves it empty.

export const SITE_NAME = "MIR Pakan Ternak";

export const SITE_DESCRIPTION =
  "Toko pakan hewan dan ternak di Salatiga. Lihat harga dan ketersediaan pakan kucing, unggas, burung, dan ternak, lalu tanyakan langsung melalui WhatsApp.";

export type StoreDay =
  | { day: string; weekday: string; opensAt: number; closesAt: number; closed?: false }
  | { day: string; weekday: string; closed: true };

export type StoreClosure = { date: string; reason: string | null };

export type StoreStatus = {
  isOpen: boolean;
  closesAt: string | null;
  nextOpenAt: string | null;
};

export type StoreInfo = {
  name: string;
  /** "+6285…" for tel: links. */
  phone: string;
  /** "+62 851-…" for display. */
  phoneDisplay: string;
  /** Digits only, for wa.me. */
  whatsapp: string;
  whatsappUrl: string;
  email: string;
  mapsUrl: string;
  landmark: string | null;
  streetAddress: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
  shortAddress: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  /** Monday first, minutes after midnight in `timezone`. */
  schedule: StoreDay[];
  closures: StoreClosure[];
  hoursSummary: string;
  /** Computed by the API at fetch time; may be a minute or two old. */
  status: StoreStatus | null;
};

/** ISO weekday 1 (Monday) … 7 (Sunday). */
export const WEEKDAYS = [
  { day: "Senin", weekday: "Monday" },
  { day: "Selasa", weekday: "Tuesday" },
  { day: "Rabu", weekday: "Wednesday" },
  { day: "Kamis", weekday: "Thursday" },
  { day: "Jumat", weekday: "Friday" },
  { day: "Sabtu", weekday: "Saturday" },
  { day: "Minggu", weekday: "Sunday" },
] as const;

const FALLBACK_HOURS: StoreDay[] = WEEKDAYS.map(({ day, weekday }) =>
  weekday === "Sunday"
    ? { day, weekday, closed: true }
    : { day, weekday, opensAt: 9 * 60, closesAt: 17 * 60 },
);

// Last resort for the WhatsApp number when the API has none.
const ENV_WHATSAPP = process.env.NEXT_PUBLIC_STORE_WHATSAPP?.replace(/\D/g, "") || "";

export const FALLBACK_STORE = {
  name: SITE_NAME,
  whatsapp: ENV_WHATSAPP || "6285155428611",
  email: "mirpakanternak@gmail.com",
  mapsUrl: "https://maps.app.goo.gl/EmHKnvp4FF49raCw7",
  landmark: "Sebelah Mr. Piss",
  streetAddress: "Jl. Tingkir Raya No. Km 07, Tingkir Tengah, Kec. Tingkir",
  shortAddress: "Jl. Tingkir Raya Km 07, Salatiga",
  locality: "Salatiga",
  region: "Jawa Tengah",
  postalCode: "50745",
  country: "ID",
  latitude: -7.3617390992416585,
  longitude: 110.52008103236403,
  timezone: "Asia/Jakarta",
  schedule: FALLBACK_HOURS,
} as const;

/** 6285155428611 -> "+62 851-5542-8611" */
export function formatPhone(digits: string) {
  const local = digits.replace(/^62/, "");
  const parts = [local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(Boolean);
  return `+62 ${parts[0]}${parts.length > 1 ? `-${parts.slice(1).join("-")}` : ""}`;
}

/** "Sebelah Mr. Piss" -> "sebelah Mr. Piss", for use mid-sentence. */
export function lowerFirst(value: string) {
  return value.charAt(0).toLocaleLowerCase("id-ID") + value.slice(1);
}

/** 540 -> "09.00" (Indonesian time notation). */
export function formatClock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

function toIsoClock(minutes: number) {
  return formatClock(minutes).replace(".", ":");
}

/** Indonesian abbreviation for the store's time zone. */
export function timezoneLabel(timezone: string) {
  return (
    { "Asia/Jakarta": "WIB", "Asia/Pontianak": "WIB", "Asia/Makassar": "WITA", "Asia/Jayapura": "WIT" }[
      timezone
    ] ?? ""
  );
}

/**
 * Groups consecutive days that share the same hours, e.g.
 * "Senin–Sabtu 09.00–17.00 WIB · Minggu tutup".
 */
export function summarizeHours(days: StoreDay[], timezone: string) {
  const zone = timezoneLabel(timezone);
  const groups: { from: string; to: string; label: string }[] = [];
  for (const entry of days) {
    const label = entry.closed
      ? "tutup"
      : `${formatClock(entry.opensAt)}–${formatClock(entry.closesAt)}${zone ? ` ${zone}` : ""}`;
    const last = groups.at(-1);
    if (last && last.label === label) last.to = entry.day;
    else groups.push({ from: entry.day, to: entry.day, label });
  }
  return groups
    .map(({ from, to, label }) => `${from === to ? from : `${from}–${to}`} ${label}`)
    .join(" · ");
}

/** schema.org OpeningHoursSpecification entries for the open days. */
export function openingHoursSpec(days: StoreDay[]) {
  return days.flatMap((entry) =>
    entry.closed
      ? []
      : [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: entry.weekday,
            opens: toIsoClock(entry.opensAt),
            closes: toIsoClock(entry.closesAt),
          },
        ],
  );
}

/** wa.me link to the store, optionally with a prefilled message. */
export function whatsappHref(whatsapp: string, message?: string) {
  const base = `https://wa.me/${whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Fills derived fields (display phone, addresses, summary). */
export function completeStoreInfo(
  base: Omit<StoreInfo, "phone" | "phoneDisplay" | "whatsappUrl" | "fullAddress" | "hoursSummary">,
): StoreInfo {
  const addressParts = [
    base.landmark,
    base.streetAddress,
    base.locality && `Kota ${base.locality}`,
    [base.region, base.postalCode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return {
    ...base,
    phone: `+${base.whatsapp}`,
    phoneDisplay: formatPhone(base.whatsapp),
    whatsappUrl: whatsappHref(base.whatsapp),
    fullAddress: addressParts.join(", "),
    hoursSummary: summarizeHours(base.schedule, base.timezone),
  };
}

/** Store info built only from the fallbacks above (API unreachable). */
export const FALLBACK_STORE_INFO: StoreInfo = completeStoreInfo({
  ...FALLBACK_STORE,
  schedule: [...FALLBACK_STORE.schedule],
  closures: [],
  status: null,
});

export const DEFAULT_OG_IMAGE = {
  url: "/images/reference/storefront.webp",
  alt: `Toko ${SITE_NAME}`,
};

// A page's `openGraph` replaces the layout's instead of merging with it, so
// pages that set their own openGraph spread these shared fields in.
export const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "id_ID",
  siteName: SITE_NAME,
} as const;

/**
 * Public origin of the storefront, used for canonical URLs, the sitemap and
 * structured data. Set SITE_URL to the production domain when deploying.
 */
export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL?.trim();
  try {
    if (configured) return new URL(configured);
  } catch {
    console.error("SITE_URL is not a valid absolute URL; using localhost.");
  }
  return new URL("http://localhost:3000");
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}
