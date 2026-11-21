"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart";
import { CartIcon } from "./icons";

export default function CartIndicator() {
  const count = useCartCount();

  return (
    <Link
      aria-label={`Keranjang, ${count} produk`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-brand-tint hover:text-brand"
      href="/keranjang"
    >
      <CartIcon />
      <span
        aria-hidden="true"
        className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold tabular-nums text-white"
      >
        {count}
      </span>
      <span className="sr-only" role="status">
        Keranjang berisi {count} produk
      </span>
    </Link>
  );
}
