"use client";

import * as React from "react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { GuideFilters } from "@/components/guides/guide-filters";
import { GuideGrid } from "@/components/guides/guide-grid";
import { getGuideCategories, getGuides } from "@/lib/guides";

const categories = getGuideCategories();

export function GuidesExplorer() {
  const [categorySlug, setCategorySlug] = React.useState<string | null>(null);
  const results = getGuides({ categorySlug });

  return (
    <Section>
      <Container className="flex flex-col gap-8">
        <GuideFilters categories={categories} selected={categorySlug} onSelect={setCategorySlug} />
        <GuideGrid guides={results} />
      </Container>
    </Section>
  );
}
