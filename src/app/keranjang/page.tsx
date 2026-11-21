import type { Metadata } from "next";
import Breadcrumb from "@/components/breadcrumb";
import CartView from "./cart-view";

// The cart lives in the visitor's browser, so this page has nothing to index.
export const metadata: Metadata = {
  title: "Keranjang",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <section className="bg-canvas px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Keranjang" }]} />
        <h1 className="mb-6 mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Keranjang</h1>
        <CartView />
      </div>
    </section>
  );
}
