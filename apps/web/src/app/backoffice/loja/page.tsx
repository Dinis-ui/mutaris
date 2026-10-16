import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeStoreTable } from "@/components/backoffice/store-table";
import { roleHasPermission } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { getProducts } from "@/lib/products-server";

export const metadata: Metadata = {
  title: "Loja",
};

export default async function BackofficeStorePage() {
  const admin = await requireAdmin();
  const canManage = roleHasPermission(admin.role, "manage");
  const products = await getProducts();

  return (
    <>
      <BackofficePageHeader
        title="Loja"
        description="Catálogo atual — os produtos marcados como “Demo” são dados de demonstração, não produtos reais."
      />
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canManage ? (
          <Button asChild variant="ghost" size="sm">
            <Link href="/backoffice/loja/imagens">Imagens não usadas</Link>
          </Button>
        ) : null}
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
