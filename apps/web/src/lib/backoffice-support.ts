import { eq } from "drizzle-orm";
import type { SupportTicketStatus } from "@workspace/types";
import { getDb } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { isValidUserId as isUuid } from "@/lib/backoffice-users";
import type { AdminSupportTicket } from "@/data/backoffice-support";

/**
 * Leitura e escrita de pedidos de suporte no backoffice (só servidor).
 * Todas as funções exigem um administrador com sessão válida.
 */

export const TICKET_STATUSES: SupportTicketStatus[] = ["open", "awaiting-reply", "resolved"];

export function isTicketStatus(value: unknown): value is SupportTicketStatus {
  return typeof value === "string" && (TICKET_STATUSES as string[]).includes(value);
}

export interface TicketDetail {
  ticket: AdminSupportTicket;
  /** ISO 8601 da última alteração. */
  updatedAt: string;
}

/** Pedido de suporte com o cliente, ou null se não existir. */
export async function getTicketDetail(id: string): Promise<TicketDetail | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;

  const [row] = await getDb()
    .select({
      id: supportTickets.id,
      reference: supportTickets.reference,
      subject: supportTickets.subject,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
      updatedAt: supportTickets.updatedAt,
      isDemo: supportTickets.isDemo,
      userId: supportTickets.userId,
      customerName: users.name,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .where(eq(supportTickets.id, id))
    .limit(1);

  if (!row) return null;

  return {
    ticket: {
      id: row.id,
      reference: row.reference,
      subject: row.subject,
      customerName: row.customerName ?? "Cliente removido",
      userId: row.userId,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      isDemo: row.isDemo,
    },
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Altera o estado do pedido. Devolve a referência, ou null se não existir. */
export async function updateTicketStatus(
  id: string,
  status: SupportTicketStatus,
): Promise<string | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;

  const [updated] = await getDb()
    .update(supportTickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(supportTickets.id, id))
    .returning({ reference: supportTickets.reference });

  return updated?.reference ?? null;
}
