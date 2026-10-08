import type { Metadata } from "next";
import { ComoFuncionaHero } from "@/components/como-funciona/hero";
import { JourneyExplorer } from "@/components/como-funciona/journey-explorer";
import { PostPurchaseSteps } from "@/components/como-funciona/post-purchase-steps";
import { NoExpertiseSection } from "@/components/como-funciona/no-expertise-section";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "Da necessidade à solução: como a MUTARIS simplifica a escolha, a configuração e a instalação da tua segurança.",
};

export default function HowItWorksPage() {
  return (
    <>
      <ComoFuncionaHero />
      <JourneyExplorer />
      <PostPurchaseSteps />
      <NoExpertiseSection />
    </>
  );
}
