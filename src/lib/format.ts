// Client-safe formatting helpers.

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatPrice(price: number) {
  return priceFormatter.format(price);
}

export function formatWeight(weightGram: number) {
  if (weightGram >= 1000) {
    return `${(weightGram / 1000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} kg`;
  }
  return `${weightGram} gr`;
}
