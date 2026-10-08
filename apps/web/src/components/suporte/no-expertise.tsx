import { Container } from "@workspace/ui/components/container";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { iconRegistry } from "@/lib/icons";

export function SupportNoExpertise() {
  const ShieldCheck = iconRegistry["shield-check"];

  return (
    <Section tone="raised">
      <Container className="flex flex-col items-center gap-6 text-center">
        <IconBadge size="lg">
          <ShieldCheck aria-hidden="true" />
        </IconBadge>
        <SectionHeading
          align="center"
          title="Não precisas de perceber de segurança."
          description="A MUTARIS existe para tornar a escolha, a instalação e a utilização das soluções simples, mesmo para quem não tem conhecimentos técnicos."
        />
      </Container>
    </Section>
  );
}