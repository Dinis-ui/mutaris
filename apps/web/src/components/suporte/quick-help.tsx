import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { iconRegistry } from "@/lib/icons";
import { quickHelpItems } from "@/data/support-quick-help";

export function SupportQuickHelp() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          title="Ajuda rápida"
          description="Escolhe o que descreve melhor o que precisas."
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickHelpItems.map((item) => {
            const Icon = iconRegistry[item.icon];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex h-full items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconBadge>
                    <Icon aria-hidden="true" />
                  </IconBadge>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}