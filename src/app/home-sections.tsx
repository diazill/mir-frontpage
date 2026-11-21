import Image from "next/image";
import Link from "next/link";
import BrandMarquee from "@/components/brand-marquee";
import { ArrowRightIcon, CategoryIcon } from "@/components/icons";
import { animalIllustration } from "@/lib/animals";
import { brandLogo, countBrands } from "@/lib/brands";
import { getStorefrontCatalog } from "@/lib/catalog";

// Each animal gets one colour from the MIR palette; extra categories cycle.
const CATEGORY_COLORS = [
  { card: "bg-brand", ring: "ring-brand" },
  { card: "bg-accent", ring: "ring-accent" },
  { card: "bg-banner", ring: "ring-banner" },
  { card: "bg-sage", ring: "ring-sage" },
];

/** Big tappable cards per animal, each with an illustration popping out. */
export async function ShopByAnimal() {
  const { products, error } = await getStorefrontCatalog();
  if (error || products.length === 0) return null;

  const counts = new Map<string, number>();
  for (const product of products) {
    if (product.category) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  const items = Array.from(counts, ([name, count]) => ({ name, count })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "id-ID"),
  );
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="belanja-hewan" className="bg-canvas px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl" id="belanja-hewan">
          Belanja per hewan
        </h2>
        <ul
          className={`grid grid-cols-1 gap-x-5 gap-y-14 pt-12 sm:grid-cols-2 ${
            items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          {items.map(({ name, count }, index) => {
            const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            const illustration = animalIllustration(name);
            return (
              <li key={name}>
                <Link
                  className={`group relative flex min-h-28 items-center gap-6 rounded-3xl ${color.card} py-4 pl-4 pr-5 text-white transition-[filter,box-shadow] hover:shadow-hero hover:brightness-110 sm:min-h-32`}
                  href={`/produk?category=${encodeURIComponent(name)}`}
                >
                  {/* The animal is bigger than its disc, so it pops out of
                      both the disc and the top of the card. */}
                  <span
                    className={`relative -mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-cream ring-4 ${color.ring} sm:h-28 sm:w-28`}
                  >
                    {illustration ? (
                      <Image
                        alt=""
                        className="absolute bottom-1 left-1/2 h-[125%] w-[125%] max-w-none -translate-x-1/2 drop-shadow-[0_8px_10px_rgb(0_0_0/0.18)] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:-rotate-3"
                        height={140}
                        src={illustration}
                        unoptimized
                        width={140}
                      />
                    ) : (
                      <CategoryIcon category={name} className="h-12 w-12 text-brand" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-2xl font-bold tracking-tight sm:text-3xl">{name}</span>
                    <span className="mt-1 block text-sm text-white/85">{count} produk</span>
                  </span>
                  <ArrowRightIcon className="ml-auto h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Brands in the catalog as a logo strip sliding to the right. */
export async function FeaturedBrands() {
  const { products, error } = await getStorefrontCatalog();
  if (error) return null;

  const brands = countBrands(products)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "id-ID"))
    .map(({ name, count }) => ({ name, count, logo: brandLogo(name) ?? null }));
  if (brands.length === 0) return null;

  return (
    <section aria-labelledby="pilihan-brand" className="border-t border-line bg-surface px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl" id="pilihan-brand">
            Pilihan brand
          </h2>
          <p className="mt-3 text-base leading-7 text-body">
            Merek yang dijual di MIR. Ketuk logo untuk melihat produknya.
          </p>
        </div>
        <BrandMarquee brands={brands} />
        <div className="mt-4 text-center">
          <Link
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand hover:text-brand-strong"
            href="/brand"
          >
            Lihat semua brand
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
