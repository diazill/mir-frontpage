import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogError from "@/components/catalog-error";
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ClockIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/icons";
import ProductCard, { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { getStorefrontCatalog } from "@/lib/catalog";
import JsonLd from "@/lib/json-ld";
import { FeaturedBrands, ShopByAnimal } from "./home-sections";
import { absoluteUrl, lowerFirst, openingHoursSpec, SITE_DESCRIPTION, type StoreInfo } from "@/lib/site";
import { getStoreInfo } from "@/lib/store";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function storeJsonLd(store: StoreInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: store.name,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    image: absoluteUrl("/images/reference/storefront.webp"),
    logo: absoluteUrl("/images/reference/mir-logo.webp"),
    telephone: store.phone,
    email: store.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.streetAddress,
      addressLocality: store.locality,
      addressRegion: store.region,
      postalCode: store.postalCode,
      addressCountry: store.country,
    },
    ...(store.latitude !== null && store.longitude !== null
      ? { geo: { "@type": "GeoCoordinates", latitude: store.latitude, longitude: store.longitude } }
      : {}),
    openingHoursSpecification: openingHoursSpec(store.schedule),
  };
}

function storeFacts(store: StoreInfo) {
  return [
    {
      icon: ClockIcon,
      title: "Jam buka",
      text: store.hoursSummary,
      href: "/lokasi",
      external: false,
    },
    {
      icon: WhatsAppIcon,
      title: "Tanya stok dan harga",
      text: `WhatsApp ${store.phoneDisplay}`,
      href: store.whatsappUrl,
      external: true,
    },
    {
      icon: PinIcon,
      title: "Alamat toko",
      text: store.landmark ? `${store.shortAddress} (${lowerFirst(store.landmark)})` : store.shortAddress,
      href: store.mapsUrl,
      external: true,
    },
  ];
}

async function FeaturedProducts() {
  const { products, error } = await getStorefrontCatalog();

  if (error) return <CatalogError detail={error} retryHref="/" />;

  const featured = products.filter((product) => product.badge);
  if (featured.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
        <p className="text-base font-semibold text-ink-soft">Belum ada produk pilihan</p>
        <Link className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand hover:text-brand-strong" href="/produk">
          Lihat semua produk
        </Link>
      </div>
    );
  }

  return (
    <ProductGrid>
      {featured.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ProductGrid>
  );
}

export default async function Home() {
  const store = await getStoreInfo();
  const facts = storeFacts(store);

  return (
    <>
      <JsonLd data={storeJsonLd(store)} />

      <section className="overflow-hidden bg-canvas">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-8 sm:py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-10 lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-sage">
              MIR Pet Shop &amp; Pakan Ternak · Salatiga
            </p>
            <h1 className="mt-4 text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Yang mereka suka,{" "}
              <span className="relative inline-block whitespace-nowrap text-accent">
                ada di sini.
                {/* Hand-drawn stroke, like a marker line on a shop sign. */}
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-3 w-full text-accent-mark sm:-bottom-3 sm:h-4"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 200 14"
                >
                  <path
                    d="M3 9.5C38 4 92 2.5 197 6.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-body sm:text-lg sm:leading-8">
              Pakan kucing, burung, unggas, dan ternak di Tingkir, Salatiga.
              Cek harga dan stok di sini, lalu pesan lewat WhatsApp atau ambil
              langsung di toko.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                href="/produk"
              >
                Lihat semua produk
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint"
                href="#pilihan"
              >
                Produk pilihan
                <ArrowDownIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* The store photo as a taped-up print, with a sticker that copies
              the "Sedia:" banner hanging on the real shopfront. */}
          <figure className="relative mx-auto w-full max-w-[520px] px-2 sm:px-6 md:ml-auto md:mr-0">
            <div className="relative -rotate-2 rounded-sm bg-surface p-3 pb-4 shadow-hero sm:p-4 sm:pb-5">
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rotate-3 bg-tape/85 shadow-sm"
              />
              <div className="aspect-[1.14/1] overflow-hidden bg-sand">
                <Image
                  alt="Tampak depan toko MIR Pakan Ternak dengan spanduk pakan burung, ayam, dan kucing"
                  className="h-full w-full object-cover object-center"
                  height={800}
                  priority
                  sizes="(max-width: 768px) 90vw, 520px"
                  src="/images/reference/storefront.webp"
                  width={653}
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-sm">
                <span className="font-semibold text-ink-soft">Toko MIR, {store.shortAddress}</span>
                <a
                  className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand hover:text-brand-strong"
                  href={store.mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Lihat peta
                  <ArrowRightIcon className="h-4 w-4" />
                </a>
              </figcaption>
            </div>

            <div className="absolute bottom-24 -left-1 max-w-[13.5rem] rotate-[-4deg] rounded-sm bg-banner px-4 py-2.5 text-white shadow-hero sm:-left-3 sm:bottom-28">
              <p className="text-base font-extrabold tracking-wide">Sedia:</p>
              <p className="text-sm font-medium leading-5">
                Pakan burung, ayam, kucing &amp; aksesoris sangkar
              </p>
            </div>
          </figure>
        </div>
      </section>

      <section aria-label="Info toko" className="border-y border-line bg-surface">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-line px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {facts.map(({ icon: Icon, title, text, href, external }) => (
            <li key={title}>
              <a
                className="flex items-center gap-3 rounded-lg py-4 transition-colors hover:text-brand sm:px-5"
                href={href}
                {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-soft">{title}</span>
                  <span className="block text-sm text-muted">{text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-sand px-4 py-14 sm:px-8 sm:py-20" id="pilihan">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Pilihan MIR</h2>
            <Link
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand hover:text-brand-strong"
              href="/produk"
            >
              Lihat semua produk
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={5} />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* Both read the cached catalog and render nothing if it failed, so the
          error message shows once (in Pilihan MIR), not three times. */}
      <Suspense fallback={null}>
        <ShopByAnimal />
      </Suspense>
      <Suspense fallback={null}>
        <FeaturedBrands />
      </Suspense>
    </>
  );
}
