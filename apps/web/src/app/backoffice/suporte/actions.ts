"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { isTicketStatus, updateTicketStatus } from "@/lib/backoffice-support";

export type TicketStatusResult = { ok: true } | { ok: false; error: string };

/**
 * Altera o estado de um pedido de suporte. As Server Actions são
 * endpoints públicos: confirmamos a sessão de administrador e validamos
 * os argumentos (vêm do cliente).
 */
export async function setTicketStatusAction(
  ticketId: string,
  status: string,
): Promise<TicketStatusResult> {
  await requireAdmin();

  if (typeof ticketId !== "string" || !isTicketStatus(status)) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const found = await updateTicketStatus(ticketId, status);
    if (!found) return { ok: false, error: "Pedido de suporte não encontrado." };
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/suporte");
  revalidatePath(`/backoffice/suporte/${ticketId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
