import { randomUUID } from "node:crypto";
import { del } from "@vercel/blob";
import { and, eq, ne } from "drizzle-orm";
import type { Product } from "@workspace/types";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { toProduct } from "@/lib/products-server";
import { isBlobImageUrl } from "@/lib/product-image";
import type { ProductFieldErrors, ProductInput } from "@/lib/backoffice-product-form";

/**
 * Escrita no catálogo (só servidor). Todas as funções exigem um
 * administrador com sessão válida. `solutionIds` e `isDemo` não são
 * editáveis aqui — mantêm-se como estão.
 */

export type SaveProductResult =
  | { ok: true; slug: string }
  | { ok: false; fieldErrors?: ProductFieldErrors; message?: string };

const SLUG_TAKEN: ProductFieldErrors = { slug: "Já existe um produto com este endereço." };

/** Apaga uma imagem do armazenamento (melhor esforço: falhar aqui não deve falhar a operação). */
async function deleteStoredImage(url: string | null | undefined): Promise<void> {
  if (!url || !isBlobImageUrl(url) || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch {
    // Uma imagem esquecida no armazenamento não afeta a loja.
  }
}

function isPlausibleId(id: string): boolean {
  return id.length > 0 && id.length <= 100;
}

export async function getProductForAdmin(id: string): Promise<Product | null> {
  await requireAdmin();
  if (!isPlausibleId(id)) return null;
  const [row] = await getDb().select().from(products).where(eq(products.id, id)).limit(1);
  return row ? toProduct(row) : null;
}

async function slugInUse(slug: string, exceptId?: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, slug), exceptId ? ne(products.id, exceptId) : undefined))
    .limit(1);
  return Boolean(row);
}

export async function createProduct(input: ProductInput): Promise<SaveProductResult> {
  await requireAdmin();
  if (await slugInUse(input.slug)) return { ok: false, fieldErrors: SLUG_TAKEN };

  await getDb()
    .insert(products)
    .values({
      id: `prod-${randomUUID()}`,
      slug: input.slug,
      name: input.name,
      category: input.category,
      description: input.description,
      priceCents: input.priceCents,
      availability: input.availability,
      features: input.features,
      image: input.image,
      solutionIds: [],
      isDemo: false,
    });

  return { ok: true, slug: input.slug };
}

export async function updateProduct(id: string, input: ProductInput): Promise<SaveProductResult> {
  await requireAdmin();
  if (!isPlausibleId(id)) return { ok: false, message: "Produto não encontrado." };
  if (await slugInUse(input.slug, id)) return { ok: false, fieldErrors: SLUG_TAKEN };

  const [previous] = await getDb()
    .select({ image: products.image })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  const updated = await getDb()
    .update(products)
    .set({
      slug: input.slug,
      name: input.name,
      category: input.category,
      description: input.description,
      priceCents: input.priceCents,
      availability: input.availability,
      features: input.features,
      image: input.image,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning({ id: products.id });

  if (updated.length === 0) return { ok: false, message: "Produto não encontrado." };
  // A imagem anterior deixa de ser usada se foi substituída ou removida.
  if (previous?.image && previous.image !== input.image) await deleteStoredImage(previous.image);
  return { ok: true, slug: input.slug };
}

/** Remove o produto. Devolve o nome, ou null se não existir. */
export async function deleteProduct(id: string): Promise<string | null> {
  await requireAdmin();
  if (!isPlausibleId(id)) return null;
  const [removed] = await getDb()
    .delete(products)
    .where(eq(products.id, id))
    .returning({ name: products.name, image: products.image });
  if (removed) await deleteStoredImage(removed.image);
  return removed?.name ?? null;
}
