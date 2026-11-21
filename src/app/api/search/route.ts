import type { NextRequest } from "next/server";
import type { SearchSuggestion } from "@/components/header-search";
import { getStorefrontCatalog } from "@/lib/catalog";
import { matchesQuery, normalizeQuery } from "@/lib/search";

const MAX_SUGGESTIONS = 6;
const MAX_QUERY_LENGTH = 100;

// Header search suggestions. The header lives in the root layout, so it asks
// this endpoint instead of receiving the whole catalog as props on every page.
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q") ?? "";
  if (raw.length > MAX_QUERY_LENGTH) {
    return Response.json({ results: [], error: "Kata kunci terlalu panjang." }, { status: 400 });
  }
  const query = normalizeQuery(raw);
  if (query.length < 2) return Response.json({ results: [] });

  const { products, error } = await getStorefrontCatalog();
  if (error) return Response.json({ results: [] }, { status: 503 });

  const results: SearchSuggestion[] = products
    .filter((product) => matchesQuery(product, query))
    .slice(0, MAX_SUGGESTIONS)
    .map(({ id, title, brand, category, price, image }) => ({
      id,
      title,
      brand,
      category,
      price,
      image,
    }));

  return Response.json({ results });
}
