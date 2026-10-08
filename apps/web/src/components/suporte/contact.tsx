import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";

export function SupportContact() {
  return (
    <Section>
      <Container className="flex flex-col items-center gap-8 text-center">
        <SectionHeading
          align="center"
          title="Ainda precisas de ajuda?"
          description="Fala connosco e explica-nos o que precisas."
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="uppercase">
            <Link href="/contactos">
              Contactar-nos
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="uppercase">
            <Link href="/conta">Entrar na minha conta</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}