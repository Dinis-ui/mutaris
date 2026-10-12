import type { ProductAvailability } from "@workspace/types";
import { productCategories } from "@/data/product-categories";

/**
 * Validação do formulário de produto. Sem dependências de servidor — é
 * usada pelo formulário (tipos e helpers) e pela Server Action (validação
 * a sério: os dados vêm do cliente e nunca são de confiança).
 */

export const AVAILABILITIES: ProductAvailability[] = ["disponivel", "sob-consulta", "brevemente"];

export const AVAILABILITY_LABEL: Record<ProductAvailability, string> = {
  disponivel: "Disponível",
  "sob-consulta": "Sob consulta",
  brevemente: "Brevemente",
};

export type ProductField =
  | "name"
  | "slug"
  | "category"
  | "description"
  | "price"
  | "availability"
  | "features";

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  description: string;
  priceCents: number;
  availability: ProductAvailability;
  features: string[];
}

export type ProductFieldErrors = Partial<Record<ProductField, string>>;

export interface ProductFormState {
  status: "idle" | "error" | "saved";
  message?: string;
  fieldErrors?: ProductFieldErrors;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_PRICE_CENTS = 10_000_000; // 100 000 €

/** "Câmara exterior — 4K" → "camara-exterior-4k". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Aceita "89", "89,5" e "89.50". Devolve cêntimos ou null se for inválido. */
export function parsePriceToCents(raw: string): number | null {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return Number.isFinite(cents) ? cents : null;
}

/** Preço em cêntimos → texto para o campo ("89,50"). */
export function centsToPriceInput(priceEuros: number): string {
  return priceEuros.toFixed(2).replace(".", ",");
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function validateProductForm(
  formData: FormData,
): { ok: true; value: ProductInput } | { ok: false; fieldErrors: ProductFieldErrors } {
  const errors: ProductFieldErrors = {};

  const name = text(formData, "name").trim();
  if (name.length < 2 || name.length > 120) errors.name = "Indica um nome (2 a 120 caracteres).";

  const slug = text(formData, "slug").trim();
  if (!slug || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    errors.slug = "Usa só letras minúsculas, números e hífenes (ex.: camara-exterior).";
  }

  const category = text(formData, "category");
  if (!productCategories.some((item) => item.slug === category)) {
    errors.category = "Escolhe uma categoria.";
  }

  const description = text(formData, "description").trim();
  if (description.length < 1 || description.length > 2000) {
    errors.description = "Indica uma descrição (até 2000 caracteres).";
  }

  const priceCents = parsePriceToCents(text(formData, "price"));
  if (priceCents === null || priceCents > MAX_PRICE_CENTS) {
    errors.price = "Indica um preço válido, por exemplo 89,50.";
  }

  const availability = text(formData, "availability");
  if (!(AVAILABILITIES as string[]).includes(availability)) {
    errors.availability = "Escolhe a disponibilidade.";
  }

  const features = text(formData, "features")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (features.length > 20 || features.some((line) => line.length > 120)) {
    errors.features = "No máximo 20 características, com até 120 caracteres cada.";
  }

  if (Object.keys(errors).length > 0 || priceCents === null) {
    return { ok: false, fieldErrors: errors };
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      category,
      description,
      priceCents,
      availability: availability as ProductAvailability,
      features,
    },
  };
}
