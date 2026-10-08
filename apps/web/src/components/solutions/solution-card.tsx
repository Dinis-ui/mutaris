import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { formatPrice } from "@/lib/format";
import type { FeaturedSolution, ProblemCategory } from "@workspace/types";

interface SolutionCardProps {
  solution: FeaturedSolution;
  category?: ProblemCategory;
}

export function SolutionCard({ solution, category }: SolutionCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        {category ? <Badge>{category.name}</Badge> : null}
        <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          <span className="text-muted-foreground">MUTARIS </span>
          {solution.name}
        </p>
        <p className="text-sm text-muted-foreground">{solution.tagline}</p>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="flex flex-col gap-2.5">
          {solution.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {highlight}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          A partir de <span className="font-semibold text-foreground">{formatPrice(solution.priceFrom)}</span>
        </span>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/solucoes/${solution.slug}`}>
            Ver solução
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
