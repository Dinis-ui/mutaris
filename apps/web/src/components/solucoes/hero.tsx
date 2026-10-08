import { Container } from "@workspace/ui/components/container";
import { DotGrid } from "@/components/shared/dot-grid";

export function SolucoesHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-line-strong">
        <DotGrid className="h-full w-full" />
      </div>

      <Container className="relative flex flex-col gap-6 py-20 md:py-28">
        <h1
          className="max-w-3xl text-balance font-semibold uppercase leading-[1.05] tracking-tight text-foreground"
          style={{ fontSize: "var(--text-hero)" }}
        >
          Segurança pensada para o teu problema.
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
          Começamos pela tua necessidade, não pelo produto. Depois de perceber o que precisas de
          proteger, ajudamos-te a encontrar a solução certa.
        </p>
      </Container>
    </section>
  );
}
