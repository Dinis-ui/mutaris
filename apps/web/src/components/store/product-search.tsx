"use client";

import { Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="relative">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor="store-search" className="sr-only">
        Pesquisar produtos
      </label>
      <Input
        id="store-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pesquisar produtos…"
        className="pl-11"
      />
    </div>
  );
}