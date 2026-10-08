import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Container } from "@workspace/ui/components/container";
import { DotGrid } from "@/components/shared/dot-grid";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-line-strong">
        <DotGrid className="h-full w-full" />
      </div>

      <Container className="relative flex flex-col gap-8 py-24 md:py-32">
        <h1
          className="max-w-3xl text-balance font-semibold uppercase leading-[1.05] tracking-tight text-foreground"
          style={{ fontSize: "var(--text-hero)" }}
        >
          Tecnologia que protege o que importa.
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground md:text-xl">
          Soluções inteligentes de segurança, sem complicações.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="uppercase">
            <Link href="/#encontrar-solucao">
              Encontrar a minha solução
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="uppercase">
            <Link href="/solucoes">Ver soluções</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
