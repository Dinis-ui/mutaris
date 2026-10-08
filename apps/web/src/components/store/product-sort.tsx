"use client";

import * as Select from "@radix-ui/react-select";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/cn";
import type { ProductSortOption } from "@workspace/types";

interface ProductSortProps {
  value: ProductSortOption;
  onChange: (value: ProductSortOption) => void;
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "preco-asc", label: "Preço mais baixo" },
  { value: "preco-desc", label: "Preço mais alto" },
];

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as ProductSortOption)}>
      <Select.Trigger
        aria-label="Ordenar produtos"
        className="inline-flex h-12 w-full items-center gap-2 rounded-lg border border-border bg-input px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
      >
        <ArrowUpDown aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Select.Value className="flex-1 text-left" />
        <Select.Icon>
          <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-50 overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-[var(--shadow-soft)]"
        >
          <Select.Viewport className="p-1">
            {SORT_OPTIONS.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex h-10 cursor-pointer select-none items-center justify-between gap-2 rounded-md px-3 text-sm text-foreground outline-none",
                  "data-[highlighted]:bg-ink-3",
                )}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check aria-hidden="true" className="h-4 w-4 text-primary" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}