"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { isOrderStatus, updateOrderStatus } from "@/lib/backoffice-orders";

export type OrderStatusResult = { ok: true } | { ok: false; error: string };

/**
 * Altera o estado de uma encomenda. As Server Actions são endpoints
 * públicos: confirmamos a sessão de administrador e validamos os
 * argumentos (vêm do cliente).
 */
export async function setOrderStatusAction(
  orderId: string,
  status: string,
): Promise<OrderStatusResult> {
  await requireAdmin();

  if (typeof orderId !== "string" || !isOrderStatus(status)) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const found = await updateOrderStatus(orderId, status);
    if (!found) return { ok: false, error: "Encomenda não encontrada." };
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/encomendas");
  revalidatePath(`/backoffice/encomendas/${orderId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
