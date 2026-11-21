import Image from "next/image";
import Link from "next/link";

export type MarqueeBrand = { name: string; logo: string | null; count: number };

// One copy of the strip must be wider than the screen for the loop to be
// seamless, so short brand lists are repeated.
const MIN_ITEMS_PER_COPY = 10;

/**
 * Brand logos sliding to the right in an endless loop. It pauses on hover or
 * keyboard focus (so logos can be clicked) and stays still when the visitor
 * prefers reduced motion.
 */
export default function BrandMarquee({ brands }: { brands: MarqueeBrand[] }) {
  const copy: MarqueeBrand[] = [];
  while (copy.length < MIN_ITEMS_PER_COPY) copy.push(...brands);

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <ul
        className="flex w-max animate-marquee-right group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{ animationDuration: `${copy.length * 3.5}s` }}
      >
        {[0, 1].map((copyIndex) =>
          copy.map((brand, index) => {
            // Only the first appearance of each brand is reachable by
            // keyboard and screen readers; the repeats are decoration.
            const isRepeat = copyIndex > 0 || index >= brands.length;
            return (
              <li aria-hidden={isRepeat || undefined} className="shrink-0 px-5 sm:px-8" key={`${copyIndex}-${index}`}>
                <Link
                  aria-label={`${brand.name}, ${brand.count} produk`}
                  className="flex h-20 min-w-28 items-center justify-center rounded-xl px-2 transition-transform hover:scale-105"
                  href={`/produk?brand=${encodeURIComponent(brand.name)}`}
                  tabIndex={isRepeat ? -1 : undefined}
                >
                  {brand.logo ? (
                    <Image
                      alt=""
                      className="h-14 w-auto max-w-40 object-contain"
                      height={56}
                      src={brand.logo}
                      width={160}
                    />
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tight text-brand">{brand.name}</span>
                  )}
                </Link>
              </li>
            );
          }),
        )}
    </ul>
    </div>
  );
}
