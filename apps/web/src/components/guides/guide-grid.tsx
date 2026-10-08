import { BookOpen } from "lucide-react";
import { GuideCard } from "@/components/guides/guide-card";
import type { Guide } from "@/data/guides";

interface GuideGridProps {
  guides: Guide[];
}

export function GuideGrid({ guides }: GuideGridProps) {
  if (guides.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <BookOpen aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Ainda não há guias nesta categoria.</p>
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-live="polite"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {guides.map((guide) => (
        <div key={guide.id} role="listitem">
          <GuideCard guide={guide} />
        </div>
      ))}
    </div>
  );
}
