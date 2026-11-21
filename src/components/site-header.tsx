import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getStorefrontCatalog } from "@/lib/catalog";
import CartIndicator from "./cart-indicator";
import HeaderSearch, { HeaderSearchFallback } from "./header-search";
import MainNav, { MainNavLinks } from "./main-nav";

async function NavWithCategories() {
  const { products } = await getStorefrontCatalog();
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "id-ID"));

  // MainNav reads the pathname, which is unknown while prerendering product
  // ids outside generateStaticParams, so it gets its own boundary.
  return (
    <Suspense fallback={<MainNavLinks categories={categories} pathname={null} />}>
      <MainNav categories={categories} />
    </Suspense>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-8 md:flex-nowrap">
        <Link aria-label="MIR Pakan Ternak, beranda" className="shrink-0" href="/">
          <Image
            alt="MIR Pakan Ternak"
            className="h-auto w-[100px] sm:w-[120px]"
            height={58}
            priority
            src="/images/reference/mir-logo.webp"
            width={180}
          />
        </Link>

        <Suspense fallback={<HeaderSearchFallback />}>
          <HeaderSearch />
        </Suspense>

        <div className="order-2 ml-auto md:order-3 md:ml-0">
          <CartIndicator />
        </div>
      </div>

      <Suspense fallback={<MainNavLinks categories={[]} pathname={null} />}>
        <NavWithCategories />
      </Suspense>
    </header>
  );
}
