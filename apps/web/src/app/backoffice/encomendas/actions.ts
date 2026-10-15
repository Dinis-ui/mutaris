"use server";

import { revalidatePath } from "next/cache";
import { FORBIDDEN_MESSAGE, roleHasPermission } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
import { isOrderStatus, updateOrderStatus } from "@/lib/backoffice-orders";
import { orderStatusLabel } from "@/lib/account";

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
  const admin = await requireAdmin();
  if (!roleHasPermission(admin.role, "manage")) return { ok: false, error: FORBIDDEN_MESSAGE };

  if (typeof orderId !== "string" || !isOrderStatus(status)) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const number = await updateOrderStatus(orderId, status);
    if (!number) return { ok: false, error: "Encomenda não encontrada." };
    await recordActivity({
      action: "order.status_changed",
      target: `${number} → ${orderStatusLabel[status]}`,
    });
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/encomendas");
  revalidatePath(`/backoffice/encomendas/${orderId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
