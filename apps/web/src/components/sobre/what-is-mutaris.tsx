import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";

export function WhatIsMutaris() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
        <SectionHeading title="O que é a MUTARIS" className="lg:w-2/5" />
        <div className="flex max-w-2xl flex-col gap-5 text-lg text-muted-foreground">
          <p>
            A MUTARIS junta tecnologia e simplicidade para ajudar pessoas e pequenos negócios a
            proteger o que lhes importa.
          </p>
          <p>
            Não é preciso perceber de marcas, protocolos ou especificações técnicas. O nosso
            trabalho é perceber a necessidade e ajudar a encontrar a solução adequada — de forma
            clara, do início ao fim.
          </p>
        </div>
      </Container>
    </Section>
  );
}
