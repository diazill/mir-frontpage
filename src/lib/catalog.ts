import "server-only";
import { cacheLife } from "next/cache";

export type StorefrontProduct = {
  id: string;
  title: string;
  blurb: string | null;
  category: string;
  brand: string | null;
  weightGram: number;
  price: number;
  image: string | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  stockStatus: "tersedia" | "habis";
  badge?: string;
};

type CatalogResult = {
  products: StorefrontProduct[];
  error: string | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function relationName(value: unknown): string {
  const relation = asRecord(value);
  return typeof relation?.name === "string" ? relation.name : "";
}

function productImages(value: unknown) {
  if (!Array.isArray(value)) return [];

  const images = value.flatMap((image, index) => {
    const record = asRecord(image);
    if (typeof record?.url !== "string") return [];

    return [{
      id:
        typeof record.id === "number" || typeof record.id === "string"
          ? String(record.id)
          : `image-${index}`,
      url: record.url,
      isPrimary: record.is_primary === true,
      // Admins order photos in the dashboard; missing values go last.
      sortOrder: typeof record.sort_order === "number" ? record.sort_order : Number.MAX_SAFE_INTEGER,
    }];
  });

  return images
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, url, isPrimary }) => ({ id, url, isPrimary }));
}

function toStorefrontProduct(value: unknown): StorefrontProduct | null {
  const product = asRecord(value);

  if (
    !product ||
    (typeof product.id !== "number" && typeof product.id !== "string") ||
    typeof product.title !== "string" ||
    typeof product.price !== "number" ||
    typeof product.weight_gram !== "number" ||
    (product.stock_status !== "tersedia" && product.stock_status !== "habis")
  ) {
    return null;
  }

  const images = productImages(product.images);
  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];

  return {
    id: String(product.id),
    title: product.title,
    blurb: typeof product.blurb === "string" ? product.blurb : null,
    category: relationName(product.category),
    brand: relationName(product.brand) || null,
    weightGram: product.weight_gram,
    price: product.price,
    image:
      (typeof product.image === "string" ? product.image : null) ??
      primaryImage?.url ??
      null,
    images:
      images.length > 0
        ? images
        : typeof product.image === "string"
          ? [{ id: "primary", url: product.image, isPrimary: true }]
          : [],
    stockStatus: product.stock_status,
    badge: product.is_best_product === true ? "Pilihan MIR" : undefined,
  };
}

const CATALOG_ERROR_MESSAGES = {
  missingUrl: "LARAVEL_API_URL belum diatur pada environment Next.js.",
  unreachable: "Tidak dapat menghubungi Laravel API. Pastikan server API berjalan.",
  badStatus: "Laravel API mengembalikan respons yang tidak berhasil.",
  rateLimited: "Laravel API membatasi permintaan (429 TERLALU_BANYAK_PERMINTAAN).",
  invalidPayload: "Format data katalog dari Laravel API tidak valid.",
  invalidProduct: "Sebagian data produk dari Laravel API tidak valid.",
} as const;

type CatalogErrorCode = keyof typeof CATALOG_ERROR_MESSAGES;

// Thrown (not returned) so a failed fetch is never stored by "use cache";
// the next request retries the API instead of serving a cached error.
class CatalogLoadError extends Error {
  constructor(readonly code: CatalogErrorCode) {
    super(code);
    this.name = "CatalogLoadError";
  }
}

// Laravel rejects per_page above 100, so larger catalogs span several pages.
const PAGE_SIZE = 100;
// Guards against a runaway loop if the API reports a bogus last_page.
const MAX_PAGES = 50;

async function fetchProductPage(
  apiUrl: string,
  page: number,
): Promise<{ data: unknown[]; lastPage: number }> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/products?per_page=${PAGE_SIZE}&page=${page}`);
  } catch (error) {
    console.error("Could not load products from the Laravel API.", error);
    throw new CatalogLoadError("unreachable");
  }

  if (response.status === 429) {
    console.error("Laravel product API rate limit reached.", { page });
    throw new CatalogLoadError("rateLimited");
  }

  if (!response.ok) {
    console.error("Laravel product API returned an unsuccessful status.", {
      status: response.status,
      page,
    });
    throw new CatalogLoadError("badStatus");
  }

  const payload = asRecord(await response.json().catch(() => null));
  const data = payload?.data;

  if (!Array.isArray(data)) {
    console.error("Laravel product API returned an invalid catalog payload.");
    throw new CatalogLoadError("invalidPayload");
  }

  // Laravel's paginator puts last_page at the top level; API resources nest
  // it under meta. A response without it is treated as a single page.
  const lastPage = payload?.last_page ?? asRecord(payload?.meta)?.last_page;
  return {
    data,
    lastPage: typeof lastPage === "number" && lastPage > 0 ? lastPage : 1,
  };
}

async function fetchStorefrontProducts(): Promise<StorefrontProduct[]> {
  "use cache";
  cacheLife("minutes");

  const apiUrl = process.env.LARAVEL_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) throw new CatalogLoadError("missingUrl");

  const first = await fetchProductPage(apiUrl, 1);
  const lastPage = Math.min(first.lastPage, MAX_PAGES);
  if (first.lastPage > MAX_PAGES) {
    console.error("Laravel product API reported more pages than allowed.", {
      lastPage: first.lastPage,
      maxPages: MAX_PAGES,
    });
  }

  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) =>
      fetchProductPage(apiUrl, index + 2),
    ),
  );
  const data = [first, ...rest].flatMap((page) => page.data);

  const products = data.map(toStorefrontProduct);

  if (products.some((product) => product === null)) {
    console.error("Laravel product API returned an invalid product record.");
    throw new CatalogLoadError("invalidProduct");
  }

  // A product can shift between pages if the catalog changes mid-fetch.
  const seen = new Set<string>();
  return products.filter((product): product is StorefrontProduct => {
    if (product === null || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function catalogErrorMessage(error: unknown): string {
  // The error may cross the cache's serialization boundary, so match on the
  // message (which carries the code) rather than relying on instanceof.
  const code = error instanceof Error ? error.message : "";
  return code in CATALOG_ERROR_MESSAGES
    ? CATALOG_ERROR_MESSAGES[code as CatalogErrorCode]
    : CATALOG_ERROR_MESSAGES.unreachable;
}

export async function getStorefrontCatalog(): Promise<CatalogResult> {
  try {
    return { products: await fetchStorefrontProducts(), error: null };
  } catch (error) {
    return { products: [], error: catalogErrorMessage(error) };
  }
}
