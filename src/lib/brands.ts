// Logos bundled in public/images/brands, used until the dashboard has a logo
// for the brand (`logo_url` from the API wins when it is set).
const BUNDLED_BRAND_LOGOS: Record<string, string> = {
  bolt: "/images/brands/bolt.webp",
  "cat-choize": "/images/brands/catchoize.webp",
  excel: "/images/brands/excel.webp",
  felibite: "/images/brands/felibite.webp",
  "me-o": "/images/brands/meo.webp",
  "royal-canin": "/images/brands/royalcanin.webp",
  whiskas: "/images/brands/whiskas.webp",
};

/** Logo for a brand: the API's `logo_url`, else a bundled file, else null. */
export function brandLogo(brand: { slug: string; logoUrl: string | null }): string | null {
  return brand.logoUrl ?? BUNDLED_BRAND_LOGOS[brand.slug] ?? null;
}
