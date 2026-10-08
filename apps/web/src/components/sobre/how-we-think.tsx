import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";

export function HowWeThink() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col items-center gap-6 text-center">
        <SectionHeading
          align="center"
          title="Como pensamos a segurança"
          description="Começamos sempre pelo problema, nunca pelo produto. Primeiro percebemos o que precisas de proteger; só depois encontramos o equipamento certo para isso."
        />
      </Container>
    </Section>
  );
}
