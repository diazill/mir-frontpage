import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Breadcrumb from "@/components/breadcrumb";
import CatalogError from "@/components/catalog-error";
import { brandLogo } from "@/lib/brands";
import { getBrands } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Merek Pakan",
  description:
    "Merek pakan hewan yang dijual di MIR Pakan Ternak Salatiga, lengkap dengan jumlah produk per merek.",
  alternates: { canonical: "/brand" },
};

async function BrandGrid() {
  const { brands: all, error } = await getBrands();
  if (error) return <CatalogError detail={error} retryHref="/brand" />;

  // Brands without active products would lead to an empty catalog page.
  const brands = all.filter((brand) => brand.productCount > 0);

  if (brands.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center text-sm text-muted">
        Belum ada brand di katalog.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {brands.map((brand) => {
        const { name, slug, productCount: count } = brand;
        const logo = brandLogo(brand);
        return (
          <li key={slug}>
            <Link
              className="group flex min-h-44 flex-col items-center justify-between rounded-2xl border border-line bg-surface p-5 text-center transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-card sm:min-h-52 sm:p-6"
              href={`/produk?brand=${encodeURIComponent(slug)}`}
            >
              <span className="flex h-24 w-full items-center justify-center sm:h-28">
                {logo ? (
                  <Image
                    alt=""
                    className="max-h-full w-auto max-w-[85%] object-contain transition-transform duration-200 group-hover:scale-105"
                    height={112}
                    src={logo}
                    unoptimized
                    width={220}
                  />
                ) : (
                  <span aria-hidden="true" className="line-clamp-2 text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
                    {name}
                  </span>
                )}
              </span>
              <span className="mt-4 flex w-full items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                <span className="truncate font-semibold text-ink-soft">{name}</span>
                <span className="shrink-0 tabular-nums text-muted">{count} produk</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function BrandPage() {
  return (
    <section className="bg-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Brand" }]} />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Brand</h1>
        <p className="mb-8 mt-3 max-w-xl text-base leading-7 text-body">
          Merek yang ada di katalog MIR. Pilih satu untuk melihat produknya.
        </p>
        <Suspense
          fallback={
            <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div className="h-44 animate-pulse rounded-2xl bg-sand sm:h-52" key={index} />
              ))}
            </div>
          }
        >
          <BrandGrid />
        </Suspense>
      </div>
    </section>
  );
}
