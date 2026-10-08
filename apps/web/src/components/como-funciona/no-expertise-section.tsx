import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Container } from "@workspace/ui/components/container";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { iconRegistry } from "@/lib/icons";
import type { IconName } from "@workspace/types";

const reassurances: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "shield-check",
    title: "Sem marcas para comparar",
    description: "Escolhemos por ti o que funciona bem em conjunto.",
  },
  {
    icon: "sliders",
    title: "Sem termos técnicos",
    description: "Explicamos tudo em linguagem simples, do início ao fim.",
  },
  {
    icon: "life-buoy",
    title: "Sem decisões sozinho",
    description: "Ajudamos-te a perceber o que precisas, passo a passo.",
  },
];

export function NoExpertiseSection() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col items-center gap-14 text-center">
        <SectionHeading
          align="center"
          title="Não precisas de saber de segurança."
          description="Não precisas de conhecer marcas, protocolos ou especificações técnicas para começar. Traduzimos aquilo que precisas numa solução que faz sentido."
        />

        <ul className="grid w-full max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
          {reassurances.map((item) => {
            const Icon = iconRegistry[item.icon];
            return (
              <li key={item.title} className="flex flex-col items-center gap-3 text-center">
                <IconBadge>
                  <Icon aria-hidden="true" />
                </IconBadge>
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </li>
            );
          })}
        </ul>

        <Button asChild size="lg" className="uppercase">
          <Link href="/#encontrar-solucao">
            Encontrar a minha solução
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </Container>
    </Section>
  );
}
