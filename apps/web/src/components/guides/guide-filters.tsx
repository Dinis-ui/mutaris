"use client";

import { cn } from "@workspace/ui/lib/cn";
import { iconRegistry } from "@/lib/icons";
import type { GuideCategory } from "@/data/guide-categories";

interface GuideFiltersProps {
  categories: GuideCategory[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export function GuideFilters({ categories, selected, onSelect }: GuideFiltersProps) {
  return (
    <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-2">
      <FilterChip label="Todas" active={selected === null} onClick={() => onSelect(null)} />
      {categories.map((category) => {
        const Icon = iconRegistry[category.icon];
        return (
          <FilterChip
            key={category.slug}
            label={category.name}
            icon={Icon}
            active={selected === category.slug}
            onClick={() => onSelect(category.slug)}
          />
        );
      })}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: (typeof iconRegistry)[keyof typeof iconRegistry];
}

function FilterChip({ label, active, onClick, icon: Icon }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-line-strong bg-card text-foreground"
          : "border-border text-muted-foreground hover:border-line-strong hover:text-foreground",
      )}
    >
      {Icon ? (
        <Icon aria-hidden="true" className={cn("h-4 w-4", active && "text-primary")} />
      ) : null}
      {label}
    </button>
  );
}
