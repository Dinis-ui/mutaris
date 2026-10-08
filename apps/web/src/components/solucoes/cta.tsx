import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";

export function SolucoesCta() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col items-center gap-8 text-center">
        <SectionHeading
          align="center"
          title="Não sabes qual é a solução certa?"
          description="Descreve o que precisas de proteger e ajudamos-te a encontrar a solução adequada."
        />
        <Button asChild size="lg" className="uppercase">
          <Link href="/#encontrar-solucao">
            Encontrar a minha solução
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </Container>
    </Section>
  );
}
