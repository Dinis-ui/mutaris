import { Container } from "@workspace/ui/components/container";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { iconRegistry } from "@/lib/icons";
import type { IconName } from "@workspace/types";

const principles: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "sliders",
    title: "Simples",
    description: "Sem termos técnicos nem passos desnecessários — só o que precisas de saber.",
  },
  {
    icon: "search",
    title: "Inteligente",
    description: "Começamos por perceber a tua necessidade, antes de falar de equipamento.",
  },
  {
    icon: "heart",
    title: "Acessível",
    description: "Pensada para quem nunca instalou um sistema de segurança na vida.",
  },
];

export function Approach() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <SectionHeading
          title="A nossa abordagem"
          description="Três ideias que guiam tudo o que construímos."
        />
        <ul className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {principles.map((principle) => {
            const Icon = iconRegistry[principle.icon];
            return (
              <li key={principle.title} className="flex flex-col gap-3">
                <IconBadge>
                  <Icon aria-hidden="true" />
                </IconBadge>
                <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
                <p className="text-sm text-muted-foreground">{principle.description}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
