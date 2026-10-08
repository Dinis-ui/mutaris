import type { Metadata } from "next";
import { StoreHero } from "@/components/store/store-hero";
import { StoreExplorer } from "@/components/store/store-explorer";

export const metadata: Metadata = {
  title: "Loja",
  description: "Encontra soluções e equipamentos para proteger a tua casa ou negócio.",
};

export default function StorePage() {
  return (
    <>
      <StoreHero />
      <StoreExplorer />
    </>
  );
}