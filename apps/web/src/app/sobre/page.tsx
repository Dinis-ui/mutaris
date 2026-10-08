import type { Metadata } from "next";
import { SobreHero } from "@/components/sobre/hero";
import { WhatIsMutaris } from "@/components/sobre/what-is-mutaris";
import { Approach } from "@/components/sobre/approach";
import { HowWeThink } from "@/components/sobre/how-we-think";
import { SobreFinalCta } from "@/components/sobre/final-cta";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A MUTARIS junta tecnologia e simplicidade para tornar mais fácil escolher, instalar e utilizar soluções de segurança.",
};

export default function SobrePage() {
  return (
    <>
      <SobreHero />
      <WhatIsMutaris />
      <Approach />
      <HowWeThink />
      <SobreFinalCta />
    </>
  );
}
