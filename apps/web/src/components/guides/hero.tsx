import { Container } from "@workspace/ui/components/container";
import { DotGrid } from "@/components/shared/dot-grid";

export function GuidesHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-line-strong">
        <DotGrid className="h-full w-full" />
      </div>

      <Container className="relative flex flex-col gap-4 py-16 md:py-20">
        <h1
          className="text-balance font-semibold uppercase leading-[1.05] tracking-tight text-foreground"
          style={{ fontSize: "var(--text-5xl)" }}
        >
          Aprende. Escolhe. Protege.
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground">
          Guias simples para perceberes os problemas de segurança mais comuns e escolheres a
          solução certa, sem termos técnicos.
        </p>
      </Container>
    </section>
  );
}
