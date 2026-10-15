import { eq } from "drizzle-orm";
import type { OrderStatus } from "@workspace/types";
import { getDb } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { isValidUserId as isUuid } from "@/lib/backoffice-users";
import type { AdminOrder } from "@/data/backoffice-orders";

/**
 * Leitura e escrita de encomendas no backoffice (só servidor). Todas as
 * funções exigem um administrador com sessão válida.
 */

export const ORDER_STATUSES: OrderStatus[] = [
  "awaiting-payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as string[]).includes(value);
}

/** Encomenda com o cliente, ou null se não existir. */
export async function getOrderDetail(id: string): Promise<AdminOrder | null> {
  await requireAdmin();
  if (!isUuid(id)) return null;

  const [row] = await getDb()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      totalCents: orders.totalCents,
      itemCount: orders.itemCount,
      createdAt: orders.createdAt,
      isDemo: orders.isDemo,
      userId: orders.userId,
      customerName: users.name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    number: row.number,
    customerName: row.customerName ?? "Cliente removido",
    userId: row.userId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    total: row.totalCents / 100,
    itemCount: row.itemCount,
    isDemo: row.isDemo,
  };
}

/** Altera o estado da encomenda. Devolve o número, ou null se não existir. */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<string | null> {
  await requireAdmin("manage");
  if (!isUuid(id)) return null;

  const [updated] = await getDb()
    .update(orders)
    .set({ status })
    .where(eq(orders.id, id))
    .returning({ number: orders.number });

  return updated?.number ?? null;
}
