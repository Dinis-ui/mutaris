"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
import { isTicketStatus, updateTicketStatus } from "@/lib/backoffice-support";
import { ticketStatusLabel } from "@/lib/account";

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
    const reference = await updateTicketStatus(ticketId, status);
    if (!reference) return { ok: false, error: "Pedido de suporte não encontrado." };
    await recordActivity({
      action: "ticket.status_changed",
      target: `${reference} → ${ticketStatusLabel[status]}`,
    });
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/suporte");
  revalidatePath(`/backoffice/suporte/${ticketId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
