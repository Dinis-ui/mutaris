import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { postPurchaseSteps } from "@/data/post-purchase";

/**
 * "O que acontece depois da compra?" — reuses the same numbered-step language
 * as the homepage's "Como funciona" section for visual consistency.
 */
export function PostPurchaseSteps() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <SectionHeading
          title="O que acontece depois da compra?"
          description="Do momento em que a encomenda chega à tua porta até teres tudo pronto."
        />
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {postPurchaseSteps.map((step) => (
            <li key={step.id} className="flex flex-col gap-3">
              <span aria-hidden="true" className="font-accent text-3xl font-normal text-primary">
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="rounded-lg border border-line-strong bg-ink-3 px-5 py-4 text-sm text-muted-foreground">
          Algumas soluções e equipamentos podem exigir instalação por um profissional. Sempre
          que isso acontecer, dizemos-te antes de finalizares a compra.
        </p>
      </Container>
    </Section>
  );
}
