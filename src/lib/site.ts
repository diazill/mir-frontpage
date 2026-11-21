export const SITE_NAME = "MIR Pakan Ternak";

export const SITE_DESCRIPTION =
  "Toko pakan hewan dan ternak di Salatiga. Lihat harga dan ketersediaan pakan kucing, unggas, burung, dan ternak, lalu tanyakan langsung melalui WhatsApp.";

// The WhatsApp number is not in the Laravel API yet, so it comes from env.
// It is public contact info, hence NEXT_PUBLIC_. Digits only, with country
// code, e.g. 6285155428611. The fallback keeps the site working without it.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP?.replace(/\D/g, "") || "6285155428611";

/** 6285155428611 -> "+62 851-5542-8611" */
function formatPhone(digits: string) {
  const local = digits.replace(/^62/, "");
  const parts = [local.slice(0, 3), local.slice(3, 7), local.slice(7)].filter(Boolean);
  return `+62 ${parts[0]}${parts.length > 1 ? `-${parts.slice(1).join("-")}` : ""}`;
}

// Safe to import from Client Components: plain data only.
export const STORE = {
  phone: `+${WHATSAPP_NUMBER}`,
  phoneDisplay: formatPhone(WHATSAPP_NUMBER),
  whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}`,
  email: "mirpakanternak@gmail.com",
  mapsUrl: "https://maps.app.goo.gl/EmHKnvp4FF49raCw7",
  landmark: "Mr. Piss",
  streetAddress: "Jl. Tingkir Raya No. Km 07, Tingkir Tengah, Kec. Tingkir",
  shortAddress: "Jl. Tingkir Raya Km 07, Salatiga",
  locality: "Salatiga",
  region: "Jawa Tengah",
  postalCode: "50745",
  country: "ID",
} as const;

export const STORE_FULL_ADDRESS = `Sebelah ${STORE.landmark}, ${STORE.streetAddress}, Kota ${STORE.locality}, ${STORE.region} ${STORE.postalCode}`;

export type StoreDay =
  | { day: string; weekday: string; opensAt: number; closesAt: number; closed?: false }
  | { day: string; weekday: string; closed: true };

/**
 * The weekly schedule, in minutes after midnight WIB. Every page, the live
 * open/closed badge and the structured data read from this one list.
 */
export const STORE_HOURS: StoreDay[] = [
  { day: "Senin", weekday: "Monday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Selasa", weekday: "Tuesday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Rabu", weekday: "Wednesday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Kamis", weekday: "Thursday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Jumat", weekday: "Friday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Sabtu", weekday: "Saturday", opensAt: 9 * 60, closesAt: 17 * 60 },
  { day: "Minggu", weekday: "Sunday", closed: true },
];

/** 540 -> "09.00" (Indonesian time notation). */
export function formatClock(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")}`;
}

function toIsoClock(minutes: number) {
  return formatClock(minutes).replace(".", ":");
}

/**
 * Groups consecutive days that share the same hours, e.g.
 * "Senin–Sabtu 09.00–17.00 WIB · Minggu tutup".
 */
function summarizeHours(days: StoreDay[]) {
  const groups: { from: string; to: string; label: string }[] = [];
  for (const entry of days) {
    const label = entry.closed
      ? "tutup"
      : `${formatClock(entry.opensAt)}–${formatClock(entry.closesAt)} WIB`;
    const last = groups.at(-1);
    if (last && last.label === label) last.to = entry.day;
    else groups.push({ from: entry.day, to: entry.day, label });
  }
  return groups
    .map(({ from, to, label }) => `${from === to ? from : `${from}–${to}`} ${label}`)
    .join(" · ");
}

export const STORE_HOURS_SUMMARY = summarizeHours(STORE_HOURS);

export const STORE_OPENING_HOURS_SPEC = STORE_HOURS.flatMap((entry) =>
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

export function whatsappLink(message?: string) {
  return message
    ? `${STORE.whatsappUrl}?text=${encodeURIComponent(message)}`
    : STORE.whatsappUrl;
}

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
