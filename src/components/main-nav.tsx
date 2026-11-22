"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AnimalMenu, { type NavCategory } from "./animal-menu";

const LINKS = [
  { href: "/produk", label: "Produk" },
  { href: "/brand", label: "Brand" },
  { href: "/tentang", label: "Tentang MIR" },
  { href: "/lokasi", label: "Lokasi & jam buka" },
  { href: "/kontak", label: "Kontak" },
] as const;

const linkClassName =
  "inline-flex min-h-11 items-center rounded-full px-3 transition-colors hover:text-brand";

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Renders without reading the URL; used as the Suspense fallback. */
export function MainNavLinks({
  categories,
  pathname,
}: {
  categories: NavCategory[];
  pathname: string | null;
}) {
  const [productLink, ...otherLinks] = LINKS;

  function renderLink({ href, label }: (typeof LINKS)[number]) {
    const active = isActive(pathname, href);
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={`${linkClassName} ${
          active ? "bg-brand-tint text-brand" : ""
        }`}
        href={href}
        key={href}
      >
        {label}
      </Link>
    );
  }

  return (
    <nav aria-label="Navigasi utama" className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-1 px-4 py-1 text-sm font-semibold text-ink-soft sm:gap-x-2 sm:px-8">
        {renderLink(productLink)}
        <AnimalMenu categories={categories} className={linkClassName} />
        {otherLinks.map(renderLink)}
      </div>
    </nav>
  );
}

export default function MainNav({ categories }: { categories: NavCategory[] }) {
  return <MainNavLinks categories={categories} pathname={usePathname()} />;
}
