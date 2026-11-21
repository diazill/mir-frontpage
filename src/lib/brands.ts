// Logos on hand in public/images/brands. Brands without a logo show their
// name instead.
const BRAND_LOGOS: Record<string, string> = {
  bolt: "/images/brands/bolt.webp",
  "cat choize": "/images/brands/catchoize.webp",
  excel: "/images/brands/excel.webp",
  felibite: "/images/brands/felibite.webp",
  "me-o": "/images/brands/meo.webp",
  "royal canin": "/images/brands/royalcanin.webp",
  whiskas: "/images/brands/whiskas.webp",
};

export function brandLogo(name: string): string | undefined {
  return BRAND_LOGOS[name.toLocaleLowerCase("id-ID")];
}

/** Brand name -> product count, from the catalog. */
export function countBrands(products: { brand: string | null }[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => ({ name, count }));
}
