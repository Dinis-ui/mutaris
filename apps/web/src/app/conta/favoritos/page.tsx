import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { AccountPageHeader } from "@/components/account/page-header";
import { EmptyState } from "@/components/account/empty-state";
import { favoriteProducts } from "@/data/account";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritesPage() {
  return (
    <>
      <AccountPageHeader
        title="Favoritos"
        description="Os produtos que guardaste para consultar mais tarde."
      />
      {favoriteProducts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteProducts.map((product) => (
            <li key={product.id}>
              <Card className="flex h-full flex-col">
                <CardHeader>
                  {product.categoryName ? <Badge className="w-fit">{product.categoryName}</Badge> : null}
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {product.name}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/produto/${product.slug}`}>
                      Ver produto
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Heart}
          title="Ainda não guardaste nenhum produto"
          description="Guarda os produtos que te interessam para os voltares a encontrar rapidamente, sem procurar outra vez."
          actions={
            <Button asChild>
              <Link href="/loja">
                Explorar a loja
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Button>
          }
        />
      )}
    </>
  );
}
