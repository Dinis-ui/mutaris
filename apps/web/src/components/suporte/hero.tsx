import { Container } from "@workspace/ui/components/container";
import { DotGrid } from "@/components/shared/dot-grid";
import { SupportSearch } from "@/components/suporte/search";

export function SupportHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-line-strong">
        <DotGrid className="h-full w-full" />
      </div>

      <Container className="relative flex flex-col items-center gap-8 py-20 text-center md:py-28">
        <div className="flex flex-col gap-4">
          <h1 className="text-balance text-4xl font-semibold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Precisas de ajuda?
          </h1>
          <p className="text-balance text-lg text-muted-foreground md:text-xl">
            Encontra rapidamente a resposta ou fala connosco.
          </p>
        </div>
        <SupportSearch />
      </Container>
    </section>
  );
}