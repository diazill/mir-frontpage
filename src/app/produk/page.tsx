import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumb";
import CatalogError from "@/components/catalog-error";
import { ProductGridSkeleton, type ProductCardData } from "@/components/product-card";
import { getBrands, getShopCategories, getStorefrontCatalog } from "@/lib/catalog";
import ProductCatalog, { type FacetOption } from "./product-catalog";

// Filtered views (?q=, ?kategori=, ?brand=) canonicalize to the full catalog
// so search engines don't index every filter combination as its own page.
export const metadata: Metadata = {
  title: "Semua Produk",
  description:
    "Katalog lengkap pakan kucing, unggas, burung, dan ternak di MIR Pakan Ternak Salatiga. Cari produk, filter per kategori atau merek, dan bandingkan harga.",
  alternates: { canonical: "/produk" },
};

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
      <div aria-hidden="true" className="hidden h-96 animate-pulse rounded-2xl bg-sand lg:block" />
      <div>
        <p className="mb-4 text-sm text-muted" role="status">
          Memuat katalog...
        </p>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

function facetsFrom(values: ({ slug: string; name: string } | null)[]): FacetOption[] {
  const facets = new Map<string, FacetOption>();
  for (const value of values) {
    if (!value) continue;
    const facet = facets.get(value.slug) ?? { value: value.slug, label: value.name, count: 0 };
    facet.count += 1;
    facets.set(value.slug, facet);
  }
  return [...facets.values()];
}

async function Catalog() {
  const [{ products, error }, { categories }, { brands }] = await Promise.all([
    getStorefrontCatalog(),
    getShopCategories(),
    getBrands(),
  ]);
  if (error) return <CatalogError detail={error} retryHref="/produk" />;

  // Filters list what the API reports; if those lists fail, the catalog still
  // works, with facets derived from the products themselves.
  const categoryOptions: FacetOption[] = categories.length
    ? categories.map(({ slug, name, productCount }) => ({ value: slug, label: name, count: productCount }))
    : facetsFrom(products.map((product) => product.category));
  const brandOptions: FacetOption[] = (
    brands.length
      ? brands
          .filter((brand) => brand.productCount > 0)
          .map(({ slug, name, productCount }) => ({ value: slug, label: name, count: productCount }))
      : facetsFrom(products.map((product) => product.brand))
  ).toSorted((a, b) => a.label.localeCompare(b.label, "id-ID"));

  // Only what the cards and filters need goes to the browser.
  const cards: ProductCardData[] = products.map(
    ({ id, slug, title, brand, category, weightGram, price, image, stockStatus, badge }) => ({
      id,
      slug,
      title,
      brand,
      category,
      weightGram,
      price,
      image,
      stockStatus,
      badge,
    }),
  );

  // ProductCatalog reads filters from the URL, so it renders on the client.
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <ProductCatalog brands={brandOptions} categories={categoryOptions} products={cards} />
    </Suspense>
  );
}

export default function ProductsPage() {
  return (
    <section className="bg-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Semua produk" }]} />
        <h1 className="mb-6 mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Semua produk
        </h1>
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog />
        </Suspense>
      </div>
    </section>
  );
}
