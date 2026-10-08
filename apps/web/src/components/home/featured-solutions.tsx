import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { SolutionCard } from "@/components/solutions/solution-card";
import { featuredSolutions } from "@/data/featured-solutions";
import { problemCategories } from "@/data/problem-categories";

export function FeaturedSolutions() {
  return (
    <Section>
      <Container className="flex flex-col gap-12">
        <SectionHeading title="Soluções em destaque" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSolutions.map((solution) => {
            const category = problemCategories.find(
              (item) => item.slug === solution.categorySlug,
            );
            return <SolutionCard key={solution.id} solution={solution} category={category} />;
          })}
        </div>
      </Container>
    </Section>
  );
}
