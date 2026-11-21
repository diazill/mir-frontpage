import type { MetadataRoute } from "next";
import { getStorefrontCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getStorefrontCatalog();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/produk"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/brand"), changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/lokasi"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/tentang"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/kontak"), changeFrequency: "monthly", priority: 0.5 },
  ];

  // If the API is down, the sitemap still lists the static pages.
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/produk/${product.id}`),
    changeFrequency: "weekly",
    priority: 0.8,
    images: product.image ? [absoluteUrl(product.image)] : undefined,
  }));

  return [...staticPages, ...productPages];
}
