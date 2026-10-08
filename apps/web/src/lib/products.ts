import { productCategories } from "@/data/product-categories";
import { products } from "@/data/products";
import type { Product, ProductCategory, ProductSortOption } from "@workspace/types";

/**
 * Os componentes da loja chamam estas funções em vez de importar os
 * arrays mock diretamente. Quando existir um catálogo real
 * (PostgreSQL/API), só este ficheiro precisa de mudar — as funções podem
 * passar a `async` e quem as chama passa a usar `await`, mas a forma
 * mantém-se igual.
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

export function getProducts(filters: ProductFilters = {}): Product[] {
  const query = filters.query?.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory =
      !filters.categorySlug || product.category === filters.categorySlug;

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
  return list; // "relevancia" mantém a ordem do catálogo por agora
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}