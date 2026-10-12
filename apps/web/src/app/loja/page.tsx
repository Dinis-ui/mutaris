import type { Metadata } from "next";
import { StoreHero } from "@/components/store/store-hero";
import { StoreExplorer } from "@/components/store/store-explorer";
import { getProducts } from "@/lib/products-server";

export const metadata: Metadata = {
  title: "Loja",
  description: "Encontra soluções e equipamentos para proteger a tua casa ou negócio.",
};

// O catálogo vem da base de dados; a página é regenerada no máximo de 60 em 60 segundos.
export const revalidate = 60;

export default async function StorePage() {
  const products = await getProducts();

  return (
    <>
      <StoreHero />
      <StoreExplorer products={products} />
    </>
  );
}
