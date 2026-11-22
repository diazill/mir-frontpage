"use client";

import { useSearchParams } from "next/navigation";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon, ChevronDownIcon, CloseIcon, FilterIcon } from "@/components/icons";
import ProductCard, { ProductGrid, type ProductCardData } from "@/components/product-card";
import { formatPrice } from "@/lib/format";
import { matchesQuery, normalizeQuery } from "@/lib/search";

type SortOrder = "featured" | "price-asc" | "price-desc";

// Four rows of the widest (5-column) grid.
const PRODUCTS_PER_BATCH = 20;

const SORT_LABELS: Record<SortOrder, string> = {
  featured: "Urutan toko",
  "price-asc": "Harga terendah",
  "price-desc": "Harga tertinggi",
};

/**
 * Resolves a filter value from the URL to an option slug. Older links used
 * names (?category=Kucing); those are matched by name. "Semua" means none.
 * Unknown values are kept as-is so the shopper sees "0 produk" and a chip to
 * clear, instead of a filter silently ignored.
 */
function resolveFacet(raw: string | null, options: FacetOption[]) {
  if (!raw || raw === "Semua") return "";
  const lower = raw.toLocaleLowerCase("id-ID");
  return (
    options.find((option) => option.value === raw)?.value ??
    options.find((option) => option.label.toLocaleLowerCase("id-ID") === lower)?.value ??
    raw
  );
}

function readSort(value: string | null): SortOrder {
  return value === "price-asc" || value === "price-desc" ? value : "featured";
}

function readMaxPrice(value: string | null) {
  const price = Number(value);
  return value && Number.isFinite(price) && price > 0 ? price : null;
}

/** `value` is the slug used in the URL; `label` is what shoppers read. */
export type FacetOption = { value: string; label: string; count: number };

type FilterPanelProps = {
  idPrefix: string;
  category: string;
  brand: string;
  categories: FacetOption[];
  brands: FacetOption[];
  totalCount: number;
  priceRange: { min: number; max: number };
  priceCeiling: number | null;
  onCategory: (value: string) => void;
  onBrand: (value: string) => void;
  onPriceDraft: (value: number) => void;
  onPriceCommit: () => void;
  onPriceReset: () => void;
};

const optionClassName = (active: boolean) =>
  `flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm transition-colors ${
    active ? "bg-brand-tint font-semibold text-brand" : "text-body hover:bg-canvas hover:text-ink-soft"
  }`;

function FilterPanel({
  idPrefix,
  category,
  brand,
  categories,
  brands,
  totalCount,
  priceRange,
  priceCeiling,
  onCategory,
  onBrand,
  onPriceDraft,
  onPriceCommit,
  onPriceReset,
}: FilterPanelProps) {
  const priceId = `${idPrefix}-price`;
  const shownCeiling = priceCeiling ?? priceRange.max;

  return (
    <div className="space-y-5">
      <section aria-labelledby={`${idPrefix}-category`}>
        <h3 className="text-base font-bold text-ink" id={`${idPrefix}-category`}>
          Jenis hewan
        </h3>
        <ul className="mt-2 space-y-0.5">
          <li>
            <button aria-pressed={category === ""} className={optionClassName(category === "")} onClick={() => onCategory("")} type="button">
              Semua produk
              <span className="text-xs tabular-nums text-muted">{totalCount}</span>
            </button>
          </li>
          {categories.map(({ value, label, count }) => (
            <li key={value}>
              <button aria-pressed={category === value} className={optionClassName(category === value)} onClick={() => onCategory(value)} type="button">
                <span className="flex items-center gap-2">
                  <CategoryIcon category={label} />
                  {label}
                </span>
                <span className="text-xs tabular-nums text-muted">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {priceRange.max > priceRange.min && (
        <section className="border-t border-line pt-5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-base font-bold text-ink" htmlFor={priceId}>
              Harga maksimal
            </label>
            {priceCeiling !== null && (
              <button className="min-h-11 px-1 text-sm font-semibold text-sage hover:text-brand" onClick={onPriceReset} type="button">
                Reset
              </button>
            )}
          </div>
          <input
            aria-valuetext={formatPrice(shownCeiling)}
            className="mt-3 h-6 w-full cursor-pointer accent-brand"
            id={priceId}
            max={priceRange.max}
            min={priceRange.min}
            onBlur={onPriceCommit}
            onChange={(event) => onPriceDraft(Number(event.target.value))}
            onKeyUp={onPriceCommit}
            onPointerUp={onPriceCommit}
            type="range"
            value={shownCeiling}
          />
          <p className="mt-1 text-sm tabular-nums text-muted">
            {formatPrice(priceRange.min)} sampai {formatPrice(shownCeiling)}
          </p>
        </section>
      )}

      {brands.length > 0 && (
        <section aria-labelledby={`${idPrefix}-brand`} className="border-t border-line pt-5">
          <h3 className="text-base font-bold text-ink" id={`${idPrefix}-brand`}>
            Brand
          </h3>
          <ul className="mt-2 space-y-0.5">
            {brands.map(({ value, label, count }) => (
              <li key={value}>
                <button
                  aria-pressed={brand === value}
                  className={optionClassName(brand === value)}
                  onClick={() => onBrand(brand === value ? "" : value)}
                  type="button"
                >
                  {label}
                  <span className="text-xs tabular-nums text-muted">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function ProductCatalog({
  products,
  categories,
  brands,
}: {
  products: ProductCardData[];
  /** Categories with products, in the dashboard's order (`getShopCategories`). */
  categories: FacetOption[];
  /** Brands with products, sorted by name (`getBrands`). */
  brands: FacetOption[];
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = resolveFacet(searchParams.get("kategori") ?? searchParams.get("category"), categories);
  const brand = resolveFacet(searchParams.get("brand"), brands);
  const sortOrder = readSort(searchParams.get("sort"));
  const urlMaxPrice = readMaxPrice(searchParams.get("max"));

  // While the slider is dragged, the draft filters live; the URL is written
  // once on release so the history isn't flooded with entries.
  const [draftMaxPrice, setDraftMaxPrice] = useState<number | null>(null);
  const priceCeiling = draftMaxPrice ?? urlMaxPrice;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTitleId = useId();

  // Close the sheet if Next.js hides this page during navigation.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => dialog?.close();
  }, []);

  function updateParams(changes: Record<string, string | null>, mode: "push" | "replace" = "push") {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  const priceRange = useMemo(() => {
    const prices = products.map((product) => product.price);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [products]);

  const visibleProducts = useMemo(() => {
    const normalized = normalizeQuery(query);
    const filtered = products.filter(
      (product) =>
        (!category || product.category?.slug === category) &&
        (!brand || product.brand?.slug === brand) &&
        (priceCeiling === null || product.price <= priceCeiling) &&
        matchesQuery(product, normalized),
    );
    if (sortOrder === "price-asc") return filtered.toSorted((a, b) => a.price - b.price);
    if (sortOrder === "price-desc") return filtered.toSorted((a, b) => b.price - a.price);
    return filtered;
  }, [brand, category, priceCeiling, products, query, sortOrder]);

  // "Load more" paging. The count is stored with the filters it was built for,
  // so any filter change starts again from the first batch.
  const filterKey = [query, category, brand, priceCeiling, sortOrder].join("|");
  const [paging, setPaging] = useState({ key: filterKey, count: PRODUCTS_PER_BATCH });
  const shownCount = paging.key === filterKey ? paging.count : PRODUCTS_PER_BATCH;
  const shownProducts = visibleProducts.slice(0, shownCount);
  const remainingCount = Math.max(0, visibleProducts.length - shownCount);

  function commitPrice() {
    if (draftMaxPrice === null) return;
    updateParams({ max: draftMaxPrice >= priceRange.max ? null : String(draftMaxPrice) }, "replace");
    setDraftMaxPrice(null);
  }

  const activeFilters = [
    query && { key: "q", label: `Pencarian: ${query}` },
    category && {
      key: "kategori",
      label: categories.find((option) => option.value === category)?.label ?? category,
    },
    brand && { key: "brand", label: brands.find((option) => option.value === brand)?.label ?? brand },
    urlMaxPrice !== null && { key: "max", label: `Maks. ${formatPrice(urlMaxPrice)}` },
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  function clearAll() {
    setDraftMaxPrice(null);
    updateParams({ q: null, kategori: null, category: null, brand: null, max: null });
  }

  const panelProps = {
    category,
    brand,
    categories,
    brands,
    totalCount: products.length,
    priceRange,
    priceCeiling,
    // Writes the new `kategori` param and drops the legacy `category` one.
    onCategory: (value: string) => updateParams({ kategori: value || null, category: null }),
    onBrand: (value: string) => updateParams({ brand: value || null }),
    onPriceDraft: setDraftMaxPrice,
    onPriceCommit: commitPrice,
    onPriceReset: () => {
      setDraftMaxPrice(null);
      updateParams({ max: null }, "replace");
    },
  };

  const filterCount = activeFilters.filter(({ key }) => key !== "q").length;

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
      <aside aria-label="Filter produk" className="hidden rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-40 lg:block">
        <FilterPanel idPrefix="side" {...panelProps} />
      </aside>

      <dialog
        aria-labelledby={dialogTitleId}
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none flex-col rounded-t-3xl bg-surface p-0 text-ink backdrop:bg-ink/40 open:flex lg:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        ref={dialogRef}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-lg font-semibold" id={dialogTitleId}>
            Filter produk
          </h2>
          <button
            aria-label="Tutup filter"
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft hover:bg-sand"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FilterPanel idPrefix="sheet" {...panelProps} />
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-3">
          <button
            className="min-h-12 flex-1 rounded-full border border-line-strong text-sm font-semibold text-brand hover:bg-brand-tint"
            onClick={clearAll}
            type="button"
          >
            Hapus filter
          </button>
          <button
            className="min-h-12 flex-[2] rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-strong"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            Lihat {visibleProducts.length} produk
          </button>
        </div>
      </dialog>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-3">
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink-soft hover:bg-brand-tint lg:hidden"
            onClick={() => dialogRef.current?.showModal()}
            type="button"
          >
            <FilterIcon />
            Filter
            {filterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs text-white">
                {filterCount}
              </span>
            )}
          </button>

          <p aria-live="polite" className="text-sm text-muted">
            <span className="font-semibold tabular-nums text-ink-soft">{visibleProducts.length}</span> produk
          </p>

          <label className="relative ml-auto block">
            <span className="sr-only">Urutkan produk</span>
            <select
              className="h-11 appearance-none rounded-full border border-line-strong bg-surface pl-4 pr-10 text-sm text-ink-soft outline-none transition-colors focus-visible:border-sage"
              onChange={(event) =>
                updateParams({ sort: event.target.value === "featured" ? null : event.target.value })
              }
              value={sortOrder}
            >
              {(Object.keys(SORT_LABELS) as SortOrder[]).map((value) => (
                <option key={value} value={value}>
                  {SORT_LABELS[value]}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          </label>
        </div>

        {activeFilters.length > 0 && (
          <ul aria-label="Filter aktif" className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map(({ key, label }) => (
              <li key={key}>
                <button
                  aria-label={`Hapus filter ${label}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-tint py-1 pl-3 pr-2 text-sm font-medium text-brand hover:bg-brand-soft"
                  onClick={() => {
                    if (key === "max") setDraftMaxPrice(null);
                    updateParams(key === "kategori" ? { kategori: null, category: null } : { [key]: null });
                  }}
                  type="button"
                >
                  <span className="max-w-[16rem] truncate">{label}</span>
                  <CloseIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
            {activeFilters.length > 1 && (
              <li>
                <button className="min-h-9 px-2 text-sm font-semibold text-sage hover:text-brand" onClick={clearAll} type="button">
                  Hapus semua
                </button>
              </li>
            )}
          </ul>
        )}

        <div className="mt-4">
          {shownProducts.length > 0 ? (
            <ProductGrid>
              {shownProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
              <p className="text-base font-semibold text-ink-soft">Tidak ada produk yang cocok</p>
              <p className="mt-2 text-sm text-muted">Coba kata kunci lain atau hapus sebagian filter.</p>
              {activeFilters.length > 0 && (
                <button
                  className="mt-5 inline-flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold text-brand hover:bg-brand-tint"
                  onClick={clearAll}
                  type="button"
                >
                  Hapus semua filter
                </button>
              )}
            </div>
          )}
        </div>

        {remainingCount > 0 && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong bg-surface px-6 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint"
              onClick={() => setPaging({ key: filterKey, count: shownCount + PRODUCTS_PER_BATCH })}
              type="button"
            >
              Muat {Math.min(PRODUCTS_PER_BATCH, remainingCount)} produk lagi
            </button>
            <p className="text-sm text-muted">
              {shownCount} dari {visibleProducts.length} produk ditampilkan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
