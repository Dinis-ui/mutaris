import { productCategories } from "@/data/product-categories";
import type { Product, ProductCategory, ProductSortOption } from "@workspace/types";

/**
 * Helpers PUROS do catálogo (sem acesso a dados) — por isso podem ser
 * usados também em componentes de cliente. A leitura dos produtos vive em
 * `lib/products-server.ts` (base de dados, só servidor).
 */

export interface ProductFilters {
  query?: string;
  categorySlug?: string | null;
}

export function getProductCategories(): ProductCategory[] {
  return productCategories;
}

export function getProductCategoryBySlug(slug: string): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function filterProducts(list: Product[], filters: ProductFilters = {}): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return list.filter((product) => {
    const matchesCategory = !filters.categorySlug || product.category === filters.categorySlug;

    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });
}

export function sortProducts(list: Product[], sort: ProductSortOption): Product[] {
  if (sort === "preco-asc") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "preco-desc") return [...list].sort((a, b) => b.price - a.price);
  return list; // "relevancia" mantém a ordem devolvida pela base de dados
}
