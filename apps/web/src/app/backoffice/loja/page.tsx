import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeStoreTable } from "@/components/backoffice/store-table";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { getProducts } from "@/lib/products-server";

export const metadata: Metadata = {
  title: "Loja",
};

export default async function BackofficeStorePage() {
  await requireAdmin();
  const products = await getProducts();

  return (
    <>
      <BackofficePageHeader
        title="Loja"
        description="Catálogo atual — os produtos marcados como “Demo” são dados de demonstração, não produtos reais."
      />
      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/backoffice/loja/novo">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Novo produto
          </Link>
        </Button>
      </div>
      <BackofficeStoreTable products={products} />
    </>
  );
}
