// Client-safe product matching, shared by the catalog filter and /api/search.

type Searchable = {
  title: string;
  category: { name: string } | null;
  brand: { name: string } | null;
};

export function normalizeQuery(query: string) {
  return query.trim().toLocaleLowerCase("id-ID");
}

/** `query` must already be normalized. An empty query matches everything. */
export function matchesQuery(product: Searchable, query: string) {
  if (!query) return true;
  return `${product.title} ${product.category?.name ?? ""} ${product.brand?.name ?? ""}`
    .toLocaleLowerCase("id-ID")
    .includes(query);
}
