import { guideCategories } from "@/data/guide-categories";
import { guides } from "@/data/guides";
import type { GuideCategory } from "@/data/guide-categories";
import type { Guide } from "@/data/guides";

/**
 * Mesmo padrão de lib/products.ts: os componentes chamam estas funções em
 * vez de importar os arrays diretamente, para que, quando existirem guias
 * reais (API/CMS), só este ficheiro precise de mudar.
 */

export interface GuideFilters {
  categorySlug?: string | null;
}

export function getGuideCategories(): GuideCategory[] {
  return guideCategories;
}

export function getGuideCategoryBySlug(slug: string): GuideCategory | undefined {
  return guideCategories.find((category) => category.slug === slug);
}

export function getGuides(filters: GuideFilters = {}): Guide[] {
  return guides.filter(
    (guide) => !filters.categorySlug || guide.categorySlug === filters.categorySlug,
  );
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
