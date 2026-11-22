import "server-only";
import { cacheLife } from "next/cache";

export type ProductCategory = { name: string; slug: string };
export type ProductBrand = { name: string; slug: string; logoUrl: string | null };

export type StorefrontProduct = {
  id: string;
  /** Stable URL key; `/produk/{slug}`. */
  slug: string;
  title: string;
  blurb: string | null;
  category: ProductCategory | null;
  brand: ProductBrand | null;
  weightGram: number;
  price: number;
  image: string | null;
  images: { id: string; url: string; isPrimary: boolean }[];
  stockStatus: "tersedia" | "habis";
  badge?: string;
  /** ISO-8601, for the sitemap. */
  updatedAt: string | null;
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  productCount: number;
  sortOrder: number;
};

export type StorefrontBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
};

// ---------------------------------------------------------------------------
// Parsing helpers

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
}

function idString(value: unknown): string | null {
  return typeof value === "number" || typeof value === "string" ? String(value) : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function productImages(value: unknown) {
  if (!Array.isArray(value)) return [];

  const images = value.flatMap((image, index) => {
    const record = asRecord(image);
    if (typeof record?.url !== "string") return [];

    return [{
      id: idString(record.id) ?? `image-${index}`,
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

function toCategory(value: unknown): ProductCategory | null {
  const record = asRecord(value);
  const name = text(record?.name);
  if (!name) return null;
  return { name, slug: text(record?.slug) ?? slugify(name) };
}

function toBrand(value: unknown): ProductBrand | null {
  const record = asRecord(value);
  const name = text(record?.name);
  if (!name) return null;
  return { name, slug: text(record?.slug) ?? slugify(name), logoUrl: text(record?.logo_url) };
}

/** Last-resort slug for records the API sent without one. */
function slugify(value: string) {
  return value
    .toLocaleLowerCase("id-ID")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

function toStorefrontProduct(value: unknown): StorefrontProduct | null {
  const product = asRecord(value);
  const id = idString(product?.id);

  if (
    !product ||
    !id ||
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
    id,
    // Older API responses had no slug; the numeric id still resolves.
    slug: text(product.slug) ?? id,
    title: product.title,
    blurb: typeof product.blurb === "string" ? product.blurb : null,
    category: toCategory(product.category),
    brand: toBrand(product.brand),
    weightGram: product.weight_gram,
    price: product.price,
    image: text(product.image) ?? primaryImage?.url ?? null,
    images:
      images.length > 0
        ? images
        : typeof product.image === "string"
          ? [{ id: "primary", url: product.image, isPrimary: true }]
          : [],
    stockStatus: product.stock_status,
    badge: product.is_best_product === true ? "Pilihan MIR" : undefined,
    updatedAt: text(product.updated_at),
  };
}

// ---------------------------------------------------------------------------
// Fetching

const CATALOG_ERROR_MESSAGES = {
  missingUrl: "LARAVEL_API_URL belum diatur pada environment Next.js.",
  unreachable: "Tidak dapat menghubungi Laravel API. Pastikan server API berjalan.",
  badStatus: "Laravel API mengembalikan respons yang tidak berhasil.",
  rateLimited: "Laravel API membatasi permintaan (429 TERLALU_BANYAK_PERMINTAAN).",
  invalidPayload: "Format data dari Laravel API tidak valid.",
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

/**
 * Server-only key that lifts the storefront's rate limit from 120 to 1,200
 * requests per minute. Without it requests still work at the normal limit.
 */
function apiHeaders(): HeadersInit {
  const key = process.env.STOREFRONT_API_KEY?.trim();
  return key ? { Accept: "application/json", "X-Storefront-Key": key } : { Accept: "application/json" };
}

function apiBaseUrl() {
  const apiUrl = process.env.LARAVEL_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) throw new CatalogLoadError("missingUrl");
  return apiUrl;
}

/**
 * GET an API path and return its JSON body. A 404 returns `null` when
 * `allowNotFound` is set; every other failure throws a CatalogLoadError.
 */
export async function apiGet(
  path: string,
  { allowNotFound = false }: { allowNotFound?: boolean } = {},
): Promise<Record<string, unknown> | null> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, { headers: apiHeaders() });
  } catch (error) {
    if (error instanceof CatalogLoadError) throw error;
    console.error(`Could not reach the Laravel API (${path}).`, error);
    throw new CatalogLoadError("unreachable");
  }

  if (response.status === 404 && allowNotFound) return null;

  if (response.status === 429) {
    console.error(`Laravel API rate limit reached (${path}).`);
    throw new CatalogLoadError("rateLimited");
  }

  if (!response.ok) {
    console.error(`Laravel API returned ${response.status} (${path}).`);
    throw new CatalogLoadError("badStatus");
  }

  const payload = asRecord(await response.json().catch(() => null));
  if (!payload) {
    console.error(`Laravel API returned invalid JSON (${path}).`);
    throw new CatalogLoadError("invalidPayload");
  }
  return payload;
}

function catalogErrorMessage(error: unknown): string {
  // The error may cross the cache's serialization boundary, so match on the
  // message (which carries the code) rather than relying on instanceof.
  const code = error instanceof Error ? error.message : "";
  return code in CATALOG_ERROR_MESSAGES
    ? CATALOG_ERROR_MESSAGES[code as CatalogErrorCode]
    : CATALOG_ERROR_MESSAGES.unreachable;
}

// Laravel rejects per_page above 100, so larger catalogs span several pages.
const PAGE_SIZE = 100;
// Guards against a runaway loop if the API reports a bogus last_page.
const MAX_PAGES = 50;

async function fetchProductPage(page: number): Promise<{ data: unknown[]; lastPage: number }> {
  const payload = await apiGet(`/products?per_page=${PAGE_SIZE}&page=${page}`);
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

  const first = await fetchProductPage(1);
  const lastPage = Math.min(first.lastPage, MAX_PAGES);
  if (first.lastPage > MAX_PAGES) {
    console.error("Laravel product API reported more pages than allowed.", {
      lastPage: first.lastPage,
      maxPages: MAX_PAGES,
    });
  }

  const rest = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, index) => fetchProductPage(index + 2)),
  );
  const products = [first, ...rest].flatMap((page) => page.data).map(toStorefrontProduct);

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

/** Slugs, old slugs and numeric ids; anything else is rejected before fetching. */
const PRODUCT_KEY = /^[\w-]{1,200}$/;

/** The API filters `?ids=` and `?slugs=` (max 100 each); combining them ANDs them, so they go separately. */
const BATCH_LIMIT = 100;

async function fetchProductsByKeys(kind: "ids" | "slugs", keys: string): Promise<StorefrontProduct[]> {
  "use cache";
  cacheLife("minutes");

  const data = (await apiGet(`/products?${kind}=${encodeURIComponent(keys)}&per_page=${BATCH_LIMIT}`))?.data;
  if (!Array.isArray(data)) throw new CatalogLoadError("invalidPayload");

  const products = data.map(toStorefrontProduct);
  if (products.some((product) => product === null)) {
    console.error("Laravel product API returned an invalid product record.", { kind });
    throw new CatalogLoadError("invalidProduct");
  }
  return products as StorefrontProduct[];
}

async function fetchProduct(key: string): Promise<StorefrontProduct | null> {
  "use cache";
  cacheLife("minutes");

  const payload = await apiGet(`/products/${encodeURIComponent(key)}`, { allowNotFound: true });
  if (!payload) return null;

  const product = toStorefrontProduct(payload.data);
  if (!product) {
    console.error("Laravel product detail API returned an invalid product.", { key });
    throw new CatalogLoadError("invalidProduct");
  }
  return product;
}

async function fetchCategories(): Promise<StorefrontCategory[]> {
  "use cache";
  cacheLife("minutes");

  const data = (await apiGet("/categories"))?.data;
  if (!Array.isArray(data)) throw new CatalogLoadError("invalidPayload");

  return data.flatMap((value) => {
    const record = asRecord(value);
    const id = idString(record?.id);
    const name = text(record?.name);
    if (!id || !name) return [];
    return [{
      id,
      name,
      slug: text(record?.slug) ?? slugify(name),
      parentId: idString(record?.parent_id),
      productCount: typeof record?.product_count === "number" ? record.product_count : 0,
      sortOrder: typeof record?.sort_order === "number" ? record.sort_order : 0,
    }];
  });
}

async function fetchBrands(): Promise<StorefrontBrand[]> {
  "use cache";
  cacheLife("minutes");

  const data = (await apiGet("/brands"))?.data;
  if (!Array.isArray(data)) throw new CatalogLoadError("invalidPayload");

  return data.flatMap((value) => {
    const record = asRecord(value);
    const id = idString(record?.id);
    const name = text(record?.name);
    if (!id || !name) return [];
    return [{
      id,
      name,
      slug: text(record?.slug) ?? slugify(name),
      logoUrl: text(record?.logo_url),
      productCount: typeof record?.product_count === "number" ? record.product_count : 0,
    }];
  });
}

// ---------------------------------------------------------------------------
// Public API: each returns data or a readable error and never throws.

export async function getStorefrontCatalog(): Promise<{
  products: StorefrontProduct[];
  error: string | null;
}> {
  try {
    return { products: await fetchStorefrontProducts(), error: null };
  } catch (error) {
    return { products: [], error: catalogErrorMessage(error) };
  }
}

/**
 * One product by slug, old slug, or numeric id. `product` is null when the
 * API answers 404. Compare `product.slug` with the key to redirect old URLs.
 */
export async function getProduct(key: string): Promise<{
  product: StorefrontProduct | null;
  error: string | null;
}> {
  if (!PRODUCT_KEY.test(key)) return { product: null, error: null };
  try {
    return { product: await fetchProduct(key), error: null };
  } catch (error) {
    return { product: null, error: catalogErrorMessage(error) };
  }
}

/**
 * Current data for a set of products, by id or slug (old slugs included).
 * Inactive and unknown products are left out. Used by the cart.
 */
export async function getProductsByKeys(keys: string[]): Promise<{
  products: StorefrontProduct[];
  error: string | null;
}> {
  const valid = [...new Set(keys)].filter((key) => PRODUCT_KEY.test(key)).toSorted();
  const ids = valid.filter((key) => /^\d+$/.test(key));
  const slugs = valid.filter((key) => !/^\d+$/.test(key));

  const requests: Promise<StorefrontProduct[]>[] = [];
  for (const [kind, list] of [["ids", ids], ["slugs", slugs]] as const) {
    for (let start = 0; start < list.length; start += BATCH_LIMIT) {
      requests.push(fetchProductsByKeys(kind, list.slice(start, start + BATCH_LIMIT).join(",")));
    }
  }

  try {
    const seen = new Set<string>();
    const products = (await Promise.all(requests)).flat().filter((product) => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
    return { products, error: null };
  } catch (error) {
    return { products: [], error: catalogErrorMessage(error) };
  }
}

export async function getCategories(): Promise<{
  categories: StorefrontCategory[];
  error: string | null;
}> {
  try {
    return { categories: await fetchCategories(), error: null };
  } catch (error) {
    return { categories: [], error: catalogErrorMessage(error) };
  }
}

/**
 * Categories a shopper can browse: those with active products, in the
 * dashboard's order. Parent groups (Pets, Poultry) have none of their own.
 */
export async function getShopCategories() {
  const { categories, error } = await getCategories();
  return {
    categories: categories
      .filter((category) => category.productCount > 0)
      .toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "id-ID")),
    error,
  };
}

export async function getBrands(): Promise<{ brands: StorefrontBrand[]; error: string | null }> {
  try {
    return { brands: await fetchBrands(), error: null };
  } catch (error) {
    return { brands: [], error: catalogErrorMessage(error) };
  }
}
