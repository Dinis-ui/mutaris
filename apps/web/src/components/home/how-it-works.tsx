import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { howItWorksSteps } from "@/data/how-it-works";

export function HowItWorks() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col gap-12">
        <SectionHeading title="Como funciona" />
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorksSteps.map((step) => (
            <li key={step.id} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="text-3xl font-normal text-primary"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
