import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { ProblemFinder } from "@/components/problem-finder/problem-finder";

export function ProblemFinderSection() {
  return (
    <Section id="encontrar-solucao">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          title="Não sabes do que precisas?"
          description="Explica-nos o teu problema. Nós encontramos a solução."
        />
        <div className="max-w-2xl">
          <ProblemFinder />
        </div>
      </Container>
    </Section>
  );
}
