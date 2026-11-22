"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
// Type-only import: the server-only catalog module is not bundled here.
import type { StorefrontProduct } from "@/lib/catalog";
import { addToCart } from "@/lib/cart";
import { formatPrice, formatWeight } from "@/lib/format";
import { CheckIcon, ImageIcon, PlusIcon } from "./icons";

export type ProductCardData = Pick<
  StorefrontProduct,
  "id" | "slug" | "title" | "brand" | "category" | "weightGram" | "price" | "image" | "stockStatus" | "badge"
>;

function AddButton({ product }: { product: ProductCardData }) {
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timeoutId = window.setTimeout(() => setJustAdded(false), 1500);
    return () => window.clearTimeout(timeoutId);
  }, [justAdded]);

  return (
    <button
      aria-label={
        justAdded
          ? `${product.title} ditambahkan ke keranjang`
          : `Tambah ${product.title} ke keranjang`
      }
      className={`relative z-10 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors active:scale-[0.98] ${
        justAdded
          ? "border-brand bg-brand text-white"
          : "border-brand/30 bg-surface text-brand hover:border-brand hover:bg-brand hover:text-white"
      }`}
      onClick={() => {
        addToCart(product.id);
        setJustAdded(true);
      }}
      type="button"
    >
      {justAdded ? (
        <>
          <CheckIcon className="h-4 w-4" />
          Ditambahkan
        </>
      ) : (
        <>
          <PlusIcon className="h-4 w-4" />
          Keranjang
        </>
      )}
    </button>
  );
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const href = `/produk/${product.slug}`;
  const inStock = product.stockStatus === "tersedia";

  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl border border-line bg-surface p-2.5 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card sm:p-3">
      {/* Photo sits in its own tinted frame with padding, so packshots with
          white backgrounds and full-bleed photos both look intentional. */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-canvas">
        {product.image ? (
          <Image
            alt=""
            className="h-full w-full object-contain p-2.5 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04] sm:p-3"
            height={800}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
            src={product.image}
            unoptimized
            width={800}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-muted">
            <ImageIcon className="h-8 w-8" />
            Foto belum tersedia
          </div>
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-md bg-brand px-2 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        {/* Always rendered so titles line up across cards without a brand. */}
        <p className="min-h-4 truncate text-xs font-semibold leading-4 text-sage">
          {product.brand?.name}
        </p>
        {/* The title link's overlay makes the whole card clickable while the
            add button stays a separate target above it. */}
        <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm leading-5 text-ink">
          <Link className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-brand" href={href}>
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 text-lg font-bold tabular-nums leading-none text-ink">
          {formatPrice(product.price)}
        </p>
        <p className="mt-1.5 text-xs text-muted">
          {formatWeight(product.weightGram)}
          {product.category && ` · ${product.category.name}`}
        </p>
        <div className="mt-auto pt-3">
          {inStock ? (
            <AddButton product={product} />
          ) : (
            <p className="flex min-h-11 items-center justify-center rounded-xl bg-sand text-sm font-medium text-muted">
              Stok habis
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {children}
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <div className="rounded-2xl border border-line bg-surface p-2.5 sm:p-3" key={index}>
          <div className="aspect-square animate-pulse rounded-xl bg-sand" />
          <div className="space-y-2 px-1 pt-3">
            <div className="h-3 w-1/3 animate-pulse rounded bg-sand" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-sand" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-sand" />
            <div className="mt-3 h-11 animate-pulse rounded-xl bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}
