import { Fragment } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";

const stages = [
  {
    number: "01",
    title: "Problema",
    description: "Contas-nos o que precisas de proteger, em poucas palavras.",
  },
  {
    number: "02",
    title: "Solução",
    description: "Sugerimos a solução adequada à tua necessidade.",
  },
  {
    number: "03",
    title: "Produtos adequados",
    description: "Cada solução reúne os equipamentos certos para a pôr a funcionar.",
  },
];

export function SolucoesHowItWorks() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <SectionHeading title="Como funciona" />
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-6">
          {stages.map((stage, index) => (
            <Fragment key={stage.number}>
              <div className="flex flex-1 flex-col gap-3">
                <span aria-hidden="true" className="font-accent text-3xl font-normal text-primary">
                  {stage.number}
                </span>
                <h3 className="text-base font-semibold text-foreground">{stage.title}</h3>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
              </div>
              {index < stages.length - 1 ? (
                <ArrowRight
                  aria-hidden="true"
                  className="hidden h-5 w-5 shrink-0 text-line-strong md:mt-2 md:block"
                />
              ) : null}
            </Fragment>
          ))}
        </div>
      </Container>
    </Section>
  );
}
