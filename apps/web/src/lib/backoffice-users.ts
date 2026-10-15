import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, supportTickets, users } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";
import type { AdminUser, AdminUserStatus } from "@/data/backoffice-users";
import type { AdminSupportTicket } from "@/data/backoffice-support";
import type { AdminOrder } from "@/data/backoffice-orders";

/**
 * Leitura e escrita de utilizadores no backoffice (só servidor). Todas as
 * funções exigem um administrador com sessão válida.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUserId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export interface UserDetail {
  user: AdminUser;
  tickets: AdminSupportTicket[];
  orders: AdminOrder[];
}

/** Utilizador com os pedidos de suporte e encomendas, ou null se não existir. */
export async function getUserDetail(id: string): Promise<UserDetail | null> {
  await requireAdmin();
  if (!isValidUserId(id)) return null;

  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!row) return null;

  const [ticketRows, orderRows] = await Promise.all([
    db.select().from(supportTickets).where(eq(supportTickets.userId, id)).orderBy(desc(supportTickets.createdAt)),
    db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)),
  ]);

  return {
    user: {
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      isDemo: row.isDemo,
    },
    tickets: ticketRows.map((ticket) => ({
      id: ticket.id,
      reference: ticket.reference,
      subject: ticket.subject,
      customerName: row.name,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      isDemo: ticket.isDemo,
    })),
    orders: orderRows.map((order) => ({
      id: order.id,
      number: order.number,
      customerName: row.name,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      total: order.totalCents / 100,
      itemCount: order.itemCount,
      isDemo: order.isDemo,
    })),
  };
}

/** Altera o estado do utilizador. Devolve o nome, ou null se não existir. */
export async function updateUserStatus(id: string, status: AdminUserStatus): Promise<string | null> {
  await requireAdmin("manage");
  if (!isValidUserId(id)) return null;

  const [updated] = await getDb()
    .update(users)
    .set({ status })
    .where(eq(users.id, id))
    .returning({ name: users.name });

  return updated?.name ?? null;
}
