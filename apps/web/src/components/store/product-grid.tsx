import { LoaderCircle, PackageSearch, TriangleAlert } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import type { Product } from "@workspace/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  /** Nada produz isto ainda (o catálogo mock não pode falhar), mas a
   *  grelha já está pronta para quando `getProducts` puder falhar. */
  error?: string | null;
}

export function ProductGrid({ products, loading = false, error = null }: ProductGridProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <TriangleAlert aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center"
      >
        <LoaderCircle aria-hidden="true" className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">A carregar produtos…</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <PackageSearch aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Não encontrámos produtos para esta pesquisa.
        </p>
      </div>
    );
  }

  return (
    <div role="list" aria-live="polite" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}