"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
import { createProduct, deleteProduct, updateProduct } from "@/lib/backoffice-products";
import { validateProductForm, type ProductFormState } from "@/lib/backoffice-product-form";

/** Atualiza as páginas do backoffice e da loja pública. */
function revalidateStore() {
  revalidatePath("/backoffice/loja");
  revalidatePath("/backoffice");
  revalidatePath("/loja");
  revalidatePath("/loja/[slug]", "page");
}

/**
 * Cria (sem `id`) ou atualiza (com `id`) um produto. As Server Actions
 * são endpoints públicos: confirmamos a sessão de administrador e
 * validamos tudo o que vem do cliente.
 */
export async function saveProductAction(formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId ? rawId : null;

  const parsed = validateProductForm(formData);
  if (!parsed.ok) {
    return { status: "error", message: "Corrige os campos assinalados.", fieldErrors: parsed.fieldErrors };
  }

  let result;
  try {
    result = id ? await updateProduct(id, parsed.value) : await createProduct(parsed.value);
  } catch {
    return { status: "error", message: "Não foi possível guardar. Tenta novamente." };
  }

  if (!result.ok) {
    return {
      status: "error",
      message: result.message ?? "Corrige os campos assinalados.",
      fieldErrors: result.fieldErrors,
    };
  }

  await recordActivity({
    action: id ? "product.updated" : "product.created",
    target: parsed.value.name,
  });
  revalidateStore();
  if (!id) redirect("/backoffice/loja");
  return { status: "saved", message: "Alterações guardadas." };
}

export type DeleteProductResult = { ok: true } | { ok: false; error: string };

export async function deleteProductAction(productId: string): Promise<DeleteProductResult> {
  await requireAdmin();
  if (typeof productId !== "string") return { ok: false, error: "Pedido inválido." };

  try {
    const name = await deleteProduct(productId);
    if (!name) return { ok: false, error: "Produto não encontrado." };
    await recordActivity({ action: "product.deleted", target: name });
  } catch {
    return { ok: false, error: "Não foi possível remover. Tenta novamente." };
  }

  revalidateStore();
  return { ok: true };
}
