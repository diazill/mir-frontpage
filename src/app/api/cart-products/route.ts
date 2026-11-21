import type { NextRequest } from "next/server";
import { getStorefrontCatalog } from "@/lib/catalog";

export type CartProduct = {
  id: string;
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

  const { products, error } = await getStorefrontCatalog();
  if (error) return Response.json({ error: "Katalog sedang tidak bisa dimuat." }, { status: 503 });

  const wanted = new Set(ids);
  const found: CartProduct[] = products
    .filter((product) => wanted.has(product.id))
    .map(({ id, title, brand, weightGram, price, image, stockStatus }) => ({
      id,
      title,
      brand,
      weightGram,
      price,
      image,
      stockStatus,
    }));

  return Response.json({ products: found });
}
