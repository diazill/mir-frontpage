"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { formatPrice } from "@/lib/format";
import { normalizeQuery } from "@/lib/search";
import { CategoryIcon, SearchIcon } from "./icons";

export type SearchSuggestion = {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  category: string | null;
  price: number;
  image: string | null;
};

type SuggestionResult = {
  query: string;
  items: SearchSuggestion[];
  failed: boolean;
};

const formClassName =
  "relative order-3 flex h-12 w-full items-center rounded-full border border-line bg-sand p-1 pl-4 transition-colors focus-within:border-sage md:order-2 md:mx-auto md:max-w-[520px]";
const inputClassName =
  "min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted sm:text-sm";
const PLACEHOLDER = "Cari produk atau merek";

function SubmitButton() {
  return (
    <button
      aria-label="Cari"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong"
      type="submit"
    >
      <SearchIcon />
    </button>
  );
}

/** Plain GET form used before the URL is known (Suspense fallback). */
export function HeaderSearchFallback() {
  return (
    <form action="/produk" className={formClassName} method="get" role="search">
      <label className="sr-only" htmlFor="header-search-fallback">
        Cari produk
      </label>
      <input
        className={inputClassName}
        id="header-search-fallback"
        name="q"
        placeholder={PLACEHOLDER}
        type="search"
      />
      <SubmitButton />
    </form>
  );
}

export default function HeaderSearch() {
  const router = useRouter();
  const urlQuery = useSearchParams().get("q") ?? "";
  const [search, setSearch] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const listboxId = useId();
  const inputId = useId();

  // Follow the URL when it changes elsewhere (e.g. a cleared search chip).
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setSearch(urlQuery);
  }

  const query = normalizeQuery(search);
  const hasQuery = query.length >= 2;

  useEffect(() => {
    if (!hasQuery) return;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results?: SearchSuggestion[] };
        setResult({ query, items: data.results ?? [], failed: !response.ok });
      } catch {
        if (!controller.signal.aborted) setResult({ query, items: [], failed: true });
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [hasQuery, query]);

  const isLoading = hasQuery && result?.query !== query;
  const suggestions = !isLoading && result ? result.items : [];
  const showList = isOpen && hasQuery;

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function openProduct(product: SearchSuggestion) {
    close();
    router.push(`/produk/${product.slug}`);
  }

  return (
    <form
      action="/produk"
      className={formClassName}
      method="get"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        close();
        const trimmed = search.trim();
        router.push(trimmed ? `/produk?q=${encodeURIComponent(trimmed)}` : "/produk");
      }}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        Cari produk
      </label>
      <input
        aria-activedescendant={
          showList && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showList}
        autoComplete="off"
        maxLength={100}
        className={inputClassName}
        id={inputId}
        name="q"
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            setActiveIndex((index) => (index + 1) % suggestions.length);
          } else if (event.key === "ArrowUp" && suggestions.length > 0) {
            event.preventDefault();
            setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
          } else if (event.key === "Enter" && showList && activeIndex >= 0) {
            event.preventDefault();
            openProduct(suggestions[activeIndex]);
          } else if (event.key === "Escape") {
            close();
          }
        }}
        placeholder={PLACEHOLDER}
        role="combobox"
        type="search"
        value={search}
      />
      <SubmitButton />

      <ul
        aria-label="Saran produk"
        className={`absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(70vh,420px)] overflow-y-auto rounded-2xl border border-line bg-surface p-2 shadow-pop ${
          showList ? "" : "hidden"
        }`}
        id={listboxId}
        role="listbox"
      >
        {isLoading ? (
          <li className="px-3 py-4 text-sm text-muted">Mencari produk...</li>
        ) : result?.failed ? (
          <li className="px-3 py-4 text-sm text-muted">
            Saran belum bisa dimuat. Tekan Enter untuk mencari.
          </li>
        ) : suggestions.length === 0 ? (
          <li className="px-3 py-4 text-sm text-muted">
            Tidak ada produk yang cocok dengan &ldquo;{search.trim()}&rdquo;.
          </li>
        ) : (
          suggestions.map((product, index) => (
            <li
              aria-selected={activeIndex === index}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                activeIndex === index ? "bg-brand-tint" : "hover:bg-canvas"
              }`}
              id={`${listboxId}-${index}`}
              key={product.id}
              onClick={() => openProduct(product)}
              onMouseDown={(event) => event.preventDefault()}
              role="option"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand text-sage">
                {product.image ? (
                  <Image
                    alt=""
                    className="h-full w-full object-contain p-1"
                    height={44}
                    src={product.image}
                    unoptimized
                    width={44}
                  />
                ) : (
                  <CategoryIcon category={product.category ?? ""} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink-soft">
                  {product.title}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {[product.brand, product.category].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-brand">
                {formatPrice(product.price)}
              </span>
            </li>
          ))
        )}
      </ul>
    </form>
  );
}
