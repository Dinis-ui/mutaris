import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeStoreTable } from "@/components/backoffice/store-table";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Loja",
};

export default function BackofficeStorePage() {
  const products = getProducts();

  return (
    <>
      <BackofficePageHeader
        title="Loja"
        description="Catálogo atual — os produtos marcados como “Demo” são dados de demonstração, não produtos reais."
      />
      <BackofficeStoreTable products={products} />
    </>
  );
}
