import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/cn";
import { formatPrice } from "@/lib/format";
import { getProductCategoryBySlug } from "@/lib/products";
import { iconRegistry } from "@/lib/icons";
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const category = getProductCategoryBySlug(product.category);
  const Icon = category ? iconRegistry[category.icon] : null;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Ainda não há fotografia de produto — o ícone da categoria substitui-a. */}
      <div className="flex aspect-[4/3] items-center justify-center bg-ink-3">
        {Icon ? <Icon aria-hidden="true" className="h-10 w-10 text-muted-foreground" /> : null}
      </div>

      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge>{category.name}</Badge> : null}
          {product.isDemo ? <Badge variant="outline">Demo</Badge> : null}
        </div>
        <p className="text-lg font-semibold tracking-tight text-foreground">{product.name}</p>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            aria-hidden="true"
            className={cn("h-1.5 w-1.5 rounded-full", AVAILABILITY_DOT[product.availability])}
          />
          {AVAILABILITY_LABEL[product.availability]}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatPrice(product.price)}</span>
          {product.isDemo ? " (preço de demonstração)" : null}
        </span>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/loja/${product.slug}`}>
            Ver produto
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}