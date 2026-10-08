"use client";

import * as React from "react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { ProductSearch } from "@/components/store/product-search";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductSort } from "@/components/store/product-sort";
import { ProductGrid } from "@/components/store/product-grid";
import { getProductCategories, getProducts, sortProducts } from "@/lib/products";
import type { ProductSortOption } from "@workspace/types";

const categories = getProductCategories();

// Uso honesto de "loading": só faz debounce da pesquisa, para não
// filtrar a cada tecla. getProducts/sortProducts já estão escritas para
// poderem vir a ser assíncronas sem este componente mudar de forma.
const SEARCH_DEBOUNCE_MS = 200;

export function StoreExplorer() {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [categorySlug, setCategorySlug] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<ProductSortOption>("relevancia");

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  // Derivado, não guardado em state: verdadeiro só durante a curta
  // janela entre escrever e o debounce acima atualizar.
  const loading = query !== debouncedQuery;

  const results = sortProducts(getProducts({ query: debouncedQuery, categorySlug }), sort);

  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <ProductSearch value={query} onChange={setQuery} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ProductFilters categories={categories} selected={categorySlug} onSelect={setCategorySlug} />
            <ProductSort value={sort} onChange={setSort} />
          </div>
        </div>

        <ProductGrid products={results} loading={loading} />
      </Container>
    </Section>
  );
}