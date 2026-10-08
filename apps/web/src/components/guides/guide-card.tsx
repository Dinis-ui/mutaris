import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardFooter, CardHeader } from "@workspace/ui/components/card";
import { getGuideCategoryBySlug } from "@/lib/guides";
import type { Guide } from "@/data/guides";

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  const category = getGuideCategoryBySlug(guide.categorySlug);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge>{category.name}</Badge> : null}
          {guide.isDemo ? <Badge variant="outline">Exemplo</Badge> : null}
        </div>
        <p className="text-lg font-semibold tracking-tight text-foreground">{guide.title}</p>
        <p className="text-sm text-muted-foreground">{guide.description}</p>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/guias/${guide.slug}`}>
            Ler guia
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
