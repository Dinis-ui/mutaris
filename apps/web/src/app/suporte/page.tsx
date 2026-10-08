import type { Metadata } from "next";
import { SupportHero } from "@/components/suporte/hero";
import { SupportQuickHelp } from "@/components/suporte/quick-help";
import { SupportCategories } from "@/components/suporte/categories";
import { SupportNoExpertise } from "@/components/suporte/no-expertise";
import { SupportContact } from "@/components/suporte/contact";

export const metadata: Metadata = {
  title: "Suporte",
  description:
    "Encontra ajuda rápida sobre soluções, encomendas e instalação, ou fala diretamente com a MUTARIS.",
};

export default function SupportPage() {
  return (
    <>
      <SupportHero />
      <SupportQuickHelp />
      <SupportCategories />
      <SupportNoExpertise />
      <SupportContact />
    </>
  );
}