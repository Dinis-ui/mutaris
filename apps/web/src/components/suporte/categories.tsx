import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { iconRegistry } from "@/lib/icons";
import { supportCategories } from "@/data/support-categories";

/**
 * Static topic labels — there are no articles behind them yet, so they are
 * intentionally not links. The data already carries a `slug` for when a real
 * guides section exists.
 */
export function SupportCategories() {
  return (
    <Section id="categorias">
      <Container className="flex flex-col gap-10">
        <SectionHeading
          title="Categorias"
          description="Os temas que vamos organizar aqui, à medida que os guias forem ficando disponíveis."
        />
        <ul className="flex flex-wrap gap-3">
          {supportCategories.map((category) => {
            const Icon = iconRegistry[category.icon];
            return (
              <li key={category.id}>
                <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {category.name}
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}