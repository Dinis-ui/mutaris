import { Container } from "@workspace/ui/components/container";
import { DotGrid } from "@/components/shared/dot-grid";

export function SobreHero() {
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
          Segurança mais simples.
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
          A MUTARIS existe para tornar mais simples escolher, instalar e utilizar soluções de
          segurança — sem complicar o que não precisa de ser complicado.
        </p>
      </Container>
    </section>
  );
}
