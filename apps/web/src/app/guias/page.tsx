import type { Metadata } from "next";
import { GuidesHero } from "@/components/guides/hero";
import { GuidesExplorer } from "@/components/guides/guides-explorer";
import { GuidesCta } from "@/components/guides/cta";

export const metadata: Metadata = {
  title: "Guias",
  description:
    "Guias simples para perceberes os problemas de segurança mais comuns e escolheres a solução certa.",
};

export default function GuidesPage() {
  return (
    <>
      <GuidesHero />
      <GuidesExplorer />
      <GuidesCta />
    </>
  );
}
