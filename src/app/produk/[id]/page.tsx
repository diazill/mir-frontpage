import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/breadcrumb";
import CatalogError from "@/components/catalog-error";
import { ArrowLeftIcon } from "@/components/icons";
import { formatPrice, formatWeight } from "@/lib/format";
import ProductGallery from "./product-gallery";
import ProductInquiry from "./product-inquiry";
import ProductShare from "./product-share";
import { getStorefrontCatalog, type StorefrontProduct } from "@/lib/catalog";
import JsonLd from "@/lib/json-ld";
import {
  absoluteUrl,
  BASE_OPEN_GRAPH,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/site";

// The whole route must be static, so a product id missing from
// generateStaticParams waits for its full render instead of being served the
// streamed fallback shell. notFound() therefore runs before the response
// starts and unknown products get a real 404 status, not a soft 404.
export const ensureStatic = "navigation";

// Awaiting params outside <Suspense> is intentional (it is what makes the 404
// above possible), so opt this route out of Instant Navigation insights.
// This does not relax the ensureStatic validation.
export const instant = false;

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

// Cache Components requires at least one param. Known products are prerendered
// at build time; other ids render on first request and are then saved.
// The placeholder keeps the build working when the API is unreachable and
// resolves to notFound() below.
export async function generateStaticParams() {
  const { products } = await getStorefrontCatalog();
  return products.length > 0
    ? products.map((product) => ({ id: product.id }))
    : [{ id: "__placeholder__" }];
}

async function findProduct(id: string) {
  const catalog = await getStorefrontCatalog();
  return {
    catalog,
    product: catalog.products.find((product) => product.id === id),
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const { product } = await findProduct(id);

  if (!product) {
    return { title: "Produk tidak ditemukan" };
  }

  const description =
    product.blurb?.trim() ||
    `${product.title}${product.brand ? ` dari ${product.brand}` : ""}. Lihat harga dan ketersediaan produk di ${SITE_NAME}.`;

  return {
    title: product.title,
    description,
    alternates: { canonical: `/produk/${product.id}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${product.title} | ${SITE_NAME}`,
      description,
      url: `/produk/${product.id}`,
      images: [
        product.image ? { url: product.image, alt: product.title } : DEFAULT_OG_IMAGE,
      ],
    },
  };
}

function productJsonLd(product: StorefrontProduct) {
  const url = absoluteUrl(`/produk/${product.id}`);
  const images = product.images.length
    ? product.images.map((image) => absoluteUrl(image.url))
    : product.image
      ? [absoluteUrl(product.image)]
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.title,
    sku: product.id,
    url,
    image: images,
    description: product.blurb?.trim() || undefined,
    category: product.category || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    weight: {
      "@type": "QuantitativeValue",
      value: product.weightGram,
      unitCode: "GRM",
    },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "IDR",
      availability:
        product.stockStatus === "tersedia"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

function ProductDetail({ product }: { product: StorefrontProduct }) {
  const inStock = product.stockStatus === "tersedia";

  return (
    <section className="bg-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Produk", href: "/produk" },
            ...(product.category
              ? [{ label: product.category, href: `/produk?category=${encodeURIComponent(product.category)}` }]
              : []),
            { label: product.title },
          ]}
        />

        <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <ProductGallery images={product.images} title={product.title} />

          <div className="lg:sticky lg:top-40">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                  inStock ? "bg-success-tint text-success" : "bg-danger-tint text-danger"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${inStock ? "bg-success-dot" : "bg-danger-dot"}`}
                />
                {inStock ? "Tersedia" : "Stok habis"}
              </span>
              {product.badge && (
                <span className="rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-sage">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-ink [text-wrap:balance] sm:text-3xl lg:text-4xl">
              {product.title}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {product.brand && (
                <Link
                  className="font-semibold text-sage hover:text-brand"
                  href={`/produk?brand=${encodeURIComponent(product.brand)}`}
                >
                  {product.brand}
                </Link>
              )}
              {product.brand && <span aria-hidden="true">·</span>}
              {product.category && (
                <>
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{formatWeight(product.weightGram)}</span>
            </p>

            <p className="mt-6 text-3xl font-bold tabular-nums tracking-tight text-brand">
              {formatPrice(product.price)}
            </p>

            <ProductInquiry productId={product.id} stockStatus={product.stockStatus} title={product.title} />
            <ProductShare title={product.title} url={absoluteUrl(`/produk/${product.id}`)} />

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="text-lg font-semibold text-ink">Tentang produk</h2>
              <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-7 text-body">
                {product.blurb?.trim() ||
                  "Deskripsi produk ini belum tersedia. Tanyakan detailnya ke tim MIR lewat WhatsApp."}
              </p>
            </div>

            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sage transition-colors hover:text-brand"
              href="/produk"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali ke semua produk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// No <Suspense> above the lookup (see `ensureStatic` above).
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const { catalog, product } = await findProduct(id);

  if (catalog.error) {
    return (
      <section className="bg-canvas px-4 py-12 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <CatalogError detail={catalog.error} retryHref={`/produk/${encodeURIComponent(id)}`} />
        </div>
      </section>
    );
  }

  if (!product) notFound();

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <ProductDetail product={product} />
    </>
  );
}
