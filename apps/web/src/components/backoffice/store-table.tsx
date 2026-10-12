"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { formatExactPrice } from "@/lib/format";
import { ProductDeleteButton } from "@/components/backoffice/product-delete-button";
import { getProductCategoryBySlug } from "@/lib/products";
import type { Product, ProductAvailability } from "@workspace/types";

const AVAILABILITY_LABEL: Record<ProductAvailability, string> = {
  disponivel: "Disponível",
  "sob-consulta": "Sob consulta",
  brevemente: "Brevemente",
};

const AVAILABILITY_DOT: Record<ProductAvailability, string> = {
  disponivel: "bg-primary",
  "sob-consulta": "bg-paper-dim",
  brevemente: "bg-paper-faint",
};

/**
 * Tabela de gestão do catálogo. Pesquisa só no frontend. "Editar" abre o
 * formulário; "Remover" apaga o produto da base de dados.
 */
export function BackofficeStoreTable({ products }: { products: Product[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = products.filter((product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pesquisar produtos…"
          className="h-11 pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado para “{query}”.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Categoria</th>
                  <th className="px-6 py-3 font-medium">Preço</th>
                  <th className="px-6 py-3 font-medium">Disponibilidade</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const category = getProductCategoryBySlug(product.category);
                  return (
                    <tr key={product.id} className="border-b border-border last:border-b-0">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/loja/${product.slug}`}
                              target="_blank"
                              className="font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              {product.name}
                            </Link>
                            {product.isDemo ? <Badge variant="outline">Demo</Badge> : null}
                          </div>
                          <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {category?.name ?? product.category}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatExactPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              AVAILABILITY_DOT[product.availability],
                            )}
                          />
                          {AVAILABILITY_LABEL[product.availability]}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start justify-end gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/backoffice/loja/${product.id}`}>Editar</Link>
                          </Button>
                          <ProductDeleteButton productId={product.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        As alterações aplicam-se de imediato à loja pública. Remover um produto é definitivo.
      </p>
    </div>
  );
}
