import { featuredSolutions } from "@/data/featured-solutions";
import { problemCategories } from "@/data/problem-categories";
import type { FeaturedSolution, ProblemCategory } from "@workspace/types";

export interface ProblemMatch {
  category: ProblemCategory;
  solution: FeaturedSolution;
}

/**
 * Deterministic, keyword-based "mock AI" matcher. No backend, no model —
 * just enough logic to make the problem-finder feel responsive.
 */
const keywordsByCategory: Record<string, string[]> = {
  casa: ["casa", "moradia", "apartamento", "familia", "cao", "gato", "jardim", "porta", "janela"],
  agua: ["agua", "fuga", "inundacao", "cano", "torneira", "cave", "humidade"],
  negocio: ["negocio", "loja", "escritorio", "armazem", "empresa", "clientes", "funcionarios"],
  incendio: ["incendio", "fumo", "fogo", "gas", "cozinha", "lareira"],
  video: ["camara", "video", "vigilancia", "gravar", "imagens", "portao"],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchProblem(description: string): ProblemMatch {
  const normalized = normalize(description);

  let bestSlug: string | null = null;
  let bestScore = 0;

  for (const [slug, keywords] of Object.entries(keywordsByCategory)) {
    const score = keywords.reduce(
      (count, keyword) => (normalized.includes(keyword) ? count + 1 : count),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestSlug = slug;
    }
  }

  const categorySlug = bestSlug ?? "casa";
  const category =
    problemCategories.find((item) => item.slug === categorySlug) ?? problemCategories[0]!;
  const solution =
    featuredSolutions.find((item) => item.categorySlug === category.slug) ??
    featuredSolutions[0]!;

  return { category, solution };
}
