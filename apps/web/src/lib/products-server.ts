import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import type { Product } from "@workspace/types";

/**
 * Leitura do catálogo a partir da base de dados (PostgreSQL). Só para
 * código de servidor — componentes de cliente recebem os produtos por props.
 */

type ProductRow = typeof products.$inferSelect;

export function toProduct(row: ProductRow): Product {
  // `images` é a fonte de verdade; `image` cobre linhas criadas pelo código antigo.
  const images = row.images.length > 0 ? row.images : row.image ? [row.image] : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    price: row.priceCents / 100,
    currency: "EUR",
    image: images[0],
    images,
    availability: row.availability,
    features: row.features,
    solutionIds: row.solutionIds,
    isDemo: row.isDemo,
  };
}

export async function getProducts(filters: { categorySlug?: string | null } = {}): Promise<Product[]> {
  const rows = await getDb()
    .select()
    .from(products)
    .where(and(filters.categorySlug ? eq(products.category, filters.categorySlug) : undefined))
    .orderBy(asc(products.createdAt), asc(products.name));

  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await getDb().select().from(products).where(eq(products.slug, slug)).limit(1);
  return row ? toProduct(row) : undefined;
}
