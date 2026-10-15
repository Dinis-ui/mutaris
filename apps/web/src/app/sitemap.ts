import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { guides } from "@/data/guides";
import { getProducts } from "@/lib/products-server";

// Regenera no máximo de hora a hora (os produtos vêm da base de dados).
export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/loja",
  "/solucoes",
  "/como-funciona",
  "/guias",
  "/suporte",
  "/sobre",
  "/termos",
  "/privacidade",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    ...STATIC_PATHS.map((path) => ({ url: `${siteConfig.url}${path}` })),
    ...guides.map((guide) => ({ url: `${siteConfig.url}/guias/${guide.slug}` })),
  ];

  try {
    // Produtos de demonstração não entram no sitemap.
    const products = await getProducts();
    for (const product of products) {
      if (!product.isDemo) entries.push({ url: `${siteConfig.url}/loja/${product.slug}` });
    }
  } catch (error) {
    console.error("Sitemap: não foi possível ler os produtos.", error);
  }

  return entries;
}
