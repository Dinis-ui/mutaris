import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { problemCategories } from "@/data/problem-categories";
import { iconRegistry } from "@/lib/icons";

export function ProblemCategories() {
  return (
    <Section tone="raised">
      <Container className="flex flex-col gap-12">
        <SectionHeading title="O que queres proteger?" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problemCategories.map((category) => {
            const Icon = iconRegistry[category.icon];
            return (
              <li key={category.id}>
                <Link
                  href={`/solucoes/${category.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconBadge>
                    <Icon aria-hidden="true" />
                  </IconBadge>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                    Ver soluções
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
