import type { Metadata } from "next";
import { ExternalIcon, PinIcon } from "@/components/icons";
import { lowerFirst } from "@/lib/site";
import { getStoreInfo } from "@/lib/store";
import StoreHours from "./store-hours";

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreInfo();
  return {
    title: "Lokasi & Jam Buka",
    description: `Lokasi toko ${store.name} di ${store.shortAddress}. Buka ${store.hoursSummary}.`,
    alternates: { canonical: "/lokasi" },
  };
}

const DEFAULT_MAP_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=110.485%2C-7.385%2C110.555%2C-7.335&layer=mapnik&marker=-7.3617390992416585%2C110.52008103236403";

/** OpenStreetMap embed around a point, about 3.5 km wide. */
function osmEmbedUrl(lat: number, lng: number) {
  const bbox = [lng - 0.035, lat - 0.025, lng + 0.035, lat + 0.025].map((n) => n.toFixed(5)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`;
}

export default async function StoreLocationPage() {
  const store = await getStoreInfo();
  // The embedded map centres on the stored coordinates.
  const mapUrl =
    store.latitude !== null && store.longitude !== null
      ? osmEmbedUrl(store.latitude, store.longitude)
      : DEFAULT_MAP_URL;

  return (
    <section className="bg-canvas px-4 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
            Lokasi &amp; jam buka
          </h1>
          <p className="mt-4 text-base leading-7 text-body">
            Toko MIR ada di {store.shortAddress}
            {store.landmark ? `, ${lowerFirst(store.landmark)}` : ""}.
            Buka {store.hoursSummary}.
          </p>
        </div>

        <StoreHours
          closures={store.closures}
          initialStatus={store.status}
          schedule={store.schedule}
          timezone={store.timezone}
        />

        <section aria-labelledby="alamat-toko" className="mt-12 sm:mt-16">
          <h2 className="mb-5 text-xl font-semibold text-ink sm:text-2xl" id="alamat-toko">
            Alamat
          </h2>
          <div className="grid overflow-hidden rounded-3xl border border-line bg-surface lg:grid-cols-[1.4fr_0.8fr]">
            <iframe
              allowFullScreen
              className="h-[320px] w-full border-0 sm:h-[420px]"
              loading="lazy"
              src={mapUrl}
              title="Peta lokasi toko MIR di Tingkir, Salatiga"
            />
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <PinIcon className="h-6 w-6" />
              </span>
              <address className="mt-5 text-base not-italic leading-7 text-body">
                {store.fullAddress}
              </address>
              <a
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                href={store.mapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                Petunjuk arah di Google Maps
                <ExternalIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
