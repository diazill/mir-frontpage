"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { CartProduct } from "@/app/api/cart-products/route";
import {
  CartIcon,
  CloseIcon,
  ImageIcon,
  MinusIcon,
  PlusIcon,
  WhatsAppIcon,
} from "@/components/icons";
import {
  addToCart,
  clearCart,
  MAX_QUANTITY,
  removeFromCart,
  setCartQuantity,
  useCart,
  useCartReady,
} from "@/lib/cart";
import { formatPrice, formatWeight } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

type Lookup = { key: string; products: CartProduct[]; failed: boolean };
type Fulfilment = "ambil" | "antar";

const FULFILMENT_LABEL: Record<Fulfilment, string> = {
  ambil: "Ambil di toko",
  antar: "Minta diantar",
};

function buildOrderMessage({
  available,
  unavailable,
  subtotal,
  fulfilment,
  name,
  note,
}: {
  available: { product: CartProduct; quantity: number }[];
  unavailable: { product: CartProduct; quantity: number }[];
  subtotal: number;
  fulfilment: Fulfilment;
  name: string;
  note: string;
}) {
  const lines: string[] = [];
  if (available.length > 0) {
    lines.push("Halo MIR, saya mau pesan:");
    available.forEach(({ product, quantity }, index) => {
      lines.push(
        `${index + 1}. ${product.title} x${quantity} = ${formatPrice(product.price * quantity)}`,
      );
    });
    lines.push(`Perkiraan subtotal: ${formatPrice(subtotal)}`);
    if (unavailable.length > 0) lines.push("", "Tolong cek juga ketersediaan:");
  } else {
    lines.push("Halo MIR, apakah produk ini sudah tersedia lagi?");
  }
  for (const { product, quantity } of unavailable) lines.push(`- ${product.title} x${quantity}`);
  lines.push("", `Cara terima: ${FULFILMENT_LABEL[fulfilment]}`);
  if (name.trim()) lines.push(`Nama: ${name.trim()}`);
  if (note.trim()) lines.push(`Catatan: ${note.trim()}`);
  return lines.join("\n");
}

function QuantityStepper({ id, title, quantity }: { id: string; title: string; quantity: number }) {
  const stepClassName =
    "flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div
      aria-label={`Jumlah ${title}`}
      className="inline-flex items-center overflow-hidden rounded-full border border-line-strong bg-surface"
      role="group"
    >
      <button
        aria-label="Kurangi jumlah"
        className={stepClassName}
        disabled={quantity <= 1}
        onClick={() => setCartQuantity(id, quantity - 1)}
        type="button"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <output aria-live="polite" className="min-w-9 text-center text-base font-bold tabular-nums text-ink">
        {quantity}
      </output>
      <button
        aria-label="Tambah jumlah"
        className={stepClassName}
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => setCartQuantity(id, quantity + 1)}
        type="button"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CartView() {
  const ready = useCartReady();
  const cart = useCart();
  const ids = Object.keys(cart).sort();
  const key = ids.join(",");

  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [retry, setRetry] = useState(0);
  const [removed, setRemoved] = useState<{ id: string; title: string; quantity: number } | null>(null);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("ambil");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const nameId = useId();
  const noteId = useId();

  // Prices and stock are looked up again from Laravel, never trusted from
  // what the browser stored.
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(`/api/cart-products?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as { products?: CartProduct[] };
        setLookup({ key, products: data.products ?? [], failed: !response.ok });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLookup({ key, products: [], failed: true });
      });
    return () => controller.abort();
  }, [key, retry]);

  // Hide the undo notice after a few seconds.
  useEffect(() => {
    if (!removed) return;
    const timeoutId = window.setTimeout(() => setRemoved(null), 6000);
    return () => window.clearTimeout(timeoutId);
  }, [removed]);

  // Keep the last good lookup on screen while a quantity change refetches.
  const products = lookup?.products ?? [];
  const byId = new Map(products.map((product) => [product.id, product]));
  const isLoading = Boolean(key) && lookup?.key !== key && !lookup;
  const lookupFailed = lookup?.key === key && lookup.failed;

  const lines = ids.map((id) => ({ id, quantity: cart[id], product: byId.get(id) }));
  const known = lines.filter(
    (line): line is { id: string; quantity: number; product: CartProduct } => Boolean(line.product),
  );
  const available = known.filter(({ product }) => product.stockStatus === "tersedia");
  const unavailable = known.filter(({ product }) => product.stockStatus !== "tersedia");
  const missing = lookup?.key === key && !lookup.failed ? lines.filter((line) => !line.product) : [];
  const subtotal = available.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const itemCount = available.reduce((sum, { quantity }) => sum + quantity, 0);

  const undoNotice = removed && (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-body"
      role="status"
    >
      <span>
        <span className="font-semibold text-ink">{removed.title}</span> dihapus dari keranjang.
      </span>
      <button
        className="min-h-11 px-2 font-semibold text-brand hover:text-brand-strong"
        onClick={() => {
          addToCart(removed.id, removed.quantity);
          setRemoved(null);
        }}
        type="button"
      >
        Batalkan
      </button>
    </div>
  );

  if (!ready || isLoading) {
    return (
      <p className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-sm text-muted" role="status">
        Memuat keranjang...
      </p>
    );
  }

  if (ids.length === 0) {
    return (
      <>
        {undoNotice}
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand">
            <CartIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-semibold text-ink">Keranjangmu masih kosong</p>
          <p className="mt-1 text-sm text-muted">Pilih produk di katalog, lalu tekan tombol Keranjang.</p>
          <Link
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-strong"
            href="/produk"
          >
            Lihat semua produk
          </Link>
        </div>
      </>
    );
  }

  const message = buildOrderMessage({ available, unavailable, subtotal, fulfilment, name, note });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div className="min-w-0">
        {undoNotice}
        {lookupFailed && (
          <div className="mb-4 rounded-2xl border border-notice-line bg-notice-tint p-4 text-sm text-notice" role="alert">
            Harga terbaru belum bisa dimuat.{" "}
            <button className="font-semibold text-brand underline" onClick={() => setRetry((n) => n + 1)} type="button">
              Coba lagi
            </button>
          </div>
        )}

        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {lines.map(({ id, quantity, product }) => {
            const inStock = product?.stockStatus === "tersedia";
            return (
              <li className="flex gap-3 p-3 sm:gap-4 sm:p-4" key={id}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas sm:h-24 sm:w-24">
                  {product?.image ? (
                    <Image
                      alt=""
                      className="h-full w-full object-contain p-2 mix-blend-multiply"
                      height={96}
                      src={product.image}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-muted" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {product ? (
                        <>
                          {product.brand && <p className="text-xs font-semibold text-sage">{product.brand}</p>}
                          <Link className="line-clamp-2 text-sm font-medium text-ink hover:text-brand" href={`/produk/${id}`}>
                            {product.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatWeight(product.weightGram)} · {formatPrice(product.price)} / pcs
                          </p>
                        </>
                      ) : missing.some((line) => line.id === id) ? (
                        <p className="text-sm font-medium text-muted">Produk ini sudah tidak ada di katalog.</p>
                      ) : (
                        <p className="text-sm text-muted">Memuat produk...</p>
                      )}
                    </div>
                    <button
                      aria-label={`Hapus ${product?.title ?? "produk"} dari keranjang`}
                      className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sand hover:text-danger"
                      onClick={() => {
                        removeFromCart(id);
                        setRemoved({ id, title: product?.title ?? "Produk", quantity });
                      }}
                      type="button"
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QuantityStepper id={id} quantity={quantity} title={product?.title ?? "produk"} />
                    {product &&
                      (inStock ? (
                        <p className="text-base font-bold tabular-nums text-ink">
                          {formatPrice(product.price * quantity)}
                        </p>
                      ) : (
                        <span className="rounded-full bg-danger-tint px-3 py-1 text-xs font-semibold text-danger">
                          Stok habis, akan ditanyakan
                        </span>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link className="inline-flex min-h-11 items-center text-sm font-semibold text-sage hover:text-brand" href="/produk">
            Tambah produk lain
          </Link>
          <button
            className="min-h-11 px-2 text-sm font-semibold text-danger hover:underline"
            onClick={() => {
              if (window.confirm("Kosongkan semua isi keranjang?")) clearCart();
            }}
            type="button"
          >
            Kosongkan keranjang
          </button>
        </div>
      </div>

      <aside aria-labelledby="ringkasan" className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-40">
        <h2 className="text-lg font-semibold text-ink" id="ringkasan">
          Ringkasan pesanan
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-body">Produk tersedia</dt>
            <dd className="tabular-nums text-ink">{itemCount} pcs</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-line pt-3">
            <dt className="font-semibold text-ink">Perkiraan subtotal</dt>
            <dd className="text-lg font-bold tabular-nums text-ink">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-5 text-muted">
          Ini belum total final. Tim MIR akan mengonfirmasi harga, stok, dan biaya
          antar (kalau diantar) lewat WhatsApp.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-ink">Cara terima</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(FULFILMENT_LABEL) as Fulfilment[]).map((value) => (
              <label
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${
                  fulfilment === value ? "border-brand bg-brand-tint text-brand" : "border-line text-body hover:bg-canvas"
                }`}
                key={value}
              >
                <input
                  checked={fulfilment === value}
                  className="sr-only"
                  name="fulfilment"
                  onChange={() => setFulfilment(value)}
                  type="radio"
                  value={value}
                />
                {FULFILMENT_LABEL[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-sm font-semibold text-ink" htmlFor={nameId}>
          Nama <span className="font-normal text-muted">(opsional)</span>
        </label>
        <input
          autoComplete="name"
          className="mt-1.5 h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-base text-ink outline-none focus-visible:border-sage sm:text-sm"
          id={nameId}
          maxLength={60}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />

        <label className="mt-4 block text-sm font-semibold text-ink" htmlFor={noteId}>
          Catatan <span className="font-normal text-muted">(opsional)</span>
        </label>
        <textarea
          className="mt-1.5 w-full rounded-xl border border-line-strong bg-surface px-3 py-2 text-base text-ink outline-none focus-visible:border-sage sm:text-sm"
          id={noteId}
          maxLength={300}
          onChange={(event) => setNote(event.target.value)}
          placeholder={fulfilment === "antar" ? "Contoh: alamat dan patokan rumah" : "Contoh: ambil besok sore"}
          rows={3}
          value={note}
        />

        {known.length > 0 ? (
          <a
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            href={whatsappLink(message)}
            rel="noreferrer"
            target="_blank"
          >
            <WhatsAppIcon />
            {available.length > 0 ? "Kirim pesanan lewat WhatsApp" : "Tanya ketersediaan lewat WhatsApp"}
          </a>
        ) : (
          <p className="mt-5 rounded-xl bg-sand p-3 text-center text-sm text-muted">
            Belum ada produk yang bisa dipesan.
          </p>
        )}
        <p className="mt-3 text-xs leading-5 text-muted">
          Pesan berisi daftar produk di atas akan terbuka di WhatsApp. Kamu masih bisa
          mengubahnya sebelum mengirim.
        </p>
      </aside>
    </div>
  );
}
