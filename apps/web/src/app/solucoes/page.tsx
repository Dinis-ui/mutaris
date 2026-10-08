import type { Metadata } from "next";
import { SolucoesHero } from "@/components/solucoes/hero";
import { SolutionsList } from "@/components/solucoes/solutions-list";
import { SolucoesHowItWorks } from "@/components/solucoes/how-it-works";
import { SolucoesCta } from "@/components/solucoes/cta";

export const metadata: Metadata = {
  title: "Soluções",
  description:
    "Soluções MUTARIS organizadas à volta do problema que resolvem, não do produto.",
};

export default function SolucoesPage() {
  return (
    <>
      <SolucoesHero />
      <SolutionsList />
      <SolucoesHowItWorks />
      <SolucoesCta />
    </>
  );
}
