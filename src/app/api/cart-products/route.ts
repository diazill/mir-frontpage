import type { NextRequest } from "next/server";
import { getProductsByKeys } from "@/lib/catalog";

export type CartProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  weightGram: number;
  price: number;
  image: string | null;
  stockStatus: "tersedia" | "habis";
};

const MAX_IDS = 100;
const ID_PATTERN = /^[\w-]{1,64}$/;

// Current data for the products in a visitor's cart. Prices and stock always
// come from Laravel here, never from what the browser stored.
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw.split(",").filter(Boolean);

  if (ids.length > MAX_IDS || ids.some((id) => !ID_PATTERN.test(id))) {
    return Response.json({ error: "Daftar produk tidak valid." }, { status: 400 });
  }
  if (ids.length === 0) return Response.json({ products: [] });

  // Only the products in this cart, via ?ids= / ?slugs= (old slugs included).
  const { products, error } = await getProductsByKeys(ids);
  if (error) return Response.json({ error: "Katalog sedang tidak bisa dimuat." }, { status: 503 });

  const found: CartProduct[] = products.map(({ id, slug, title, brand, weightGram, price, image, stockStatus }) => ({
      id,
      slug,
      title,
      brand: brand?.name ?? null,
      weightGram,
      price,
      image,
      stockStatus,
    }));

  return Response.json({ products: found });
}
