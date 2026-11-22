"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon, WhatsAppIcon } from "@/components/icons";
import { addToCart, MAX_QUANTITY } from "@/lib/cart";
import { whatsappLink } from "@/lib/site";

export default function ProductInquiry({
  productId,
  title,
  stockStatus,
}: {
  productId: string;
  title: string;
  stockStatus: "tersedia" | "habis";
}) {
  const [quantity, setQuantity] = useState(1);
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const labelId = useId();
  const inStock = stockStatus === "tersedia";
  const message = inStock
    ? `Halo MIR, saya mau tanya soal ${title} (${quantity} pcs).`
    : `Halo MIR, kapan ${title} tersedia lagi? Saya butuh ${quantity} pcs.`;

  useEffect(() => {
    if (addedCount === null) return;
    const timeoutId = window.setTimeout(() => setAddedCount(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [addedCount]);

  const stepClassName =
    "flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40";
  const whatsappClassName = inStock
    ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-brand transition-colors hover:bg-brand-tint"
    : "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong sm:flex-none";

  return (
    <div className="mt-7 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-sm font-semibold text-body" id={labelId}>
        Jumlah
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div
          aria-labelledby={labelId}
          className="inline-flex items-center overflow-hidden rounded-full border border-line-strong"
          role="group"
        >
          <button
            aria-label="Kurangi jumlah"
            className={stepClassName}
            disabled={quantity <= 1}
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            type="button"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <output aria-live="polite" className="min-w-10 text-center text-base font-bold tabular-nums text-ink">
            {quantity}
          </output>
          <button
            aria-label="Tambah jumlah"
            className={stepClassName}
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {inStock && (
          <button
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong sm:flex-none"
            onClick={() => {
              addToCart(productId, quantity);
              setAddedCount(quantity);
            }}
            type="button"
          >
            <CartIcon />
            Tambah ke keranjang
          </button>
        )}
        <a className={whatsappClassName} href={whatsappLink(message)} rel="noreferrer" target="_blank">
          <WhatsAppIcon />
          {inStock ? "Tanya" : "Tanya kapan tersedia"}
        </a>
      </div>

      <div aria-live="polite">
        {addedCount !== null && (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-success-tint px-3 py-2 text-sm text-success">
            <CheckIcon className="h-4 w-4" />
            {addedCount} pcs ditambahkan ke keranjang.
            <Link className="font-semibold underline" href="/keranjang">
              Lihat keranjang
            </Link>
          </p>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        {inStock
          ? "Kumpulkan produk di keranjang, lalu kirim pesanannya ke tim MIR lewat WhatsApp."
          : "Produk ini sedang habis. Tim MIR bisa memberi tahu kapan stoknya datang."}
      </p>
    </div>
  );
}
