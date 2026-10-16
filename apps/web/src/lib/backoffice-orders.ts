import { asc, eq } from "drizzle-orm";
import type { OrderStatus } from "@workspace/types";
import { getDb } from "@/db";
import { orderItems, orders, users } from "@/db/schema";
import { roleHasPermission } from "@/lib/admin-permissions";
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
  const admin = await requireAdmin();
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
      shippingName: orders.shippingName,
      shippingPhone: orders.shippingPhone,
      shippingLine1: orders.shippingLine1,
      shippingLine2: orders.shippingLine2,
      shippingPostalCode: orders.shippingPostalCode,
      shippingCity: orders.shippingCity,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) return null;

  const items = await getDb()
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, row.id))
    .orderBy(asc(orderItems.position), asc(orderItems.createdAt));

  const hasAddress = Boolean(row.shippingLine1 && row.shippingPostalCode && row.shippingCity);
  // A morada é um dado pessoal: só quem trata de encomendas a vê (não o perfil Leitura/Suporte).
  const canSeeAddress = roleHasPermission(admin.role, "manage");

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
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPriceCents / 100,
    })),
    shipping:
      hasAddress && canSeeAddress
        ? {
            name: row.shippingName ?? "",
            phone: row.shippingPhone ?? "",
            line1: row.shippingLine1 ?? "",
            line2: row.shippingLine2 ?? "",
            postalCode: row.shippingPostalCode ?? "",
            city: row.shippingCity ?? "",
            country: "PT",
          }
        : null,
    shippingHidden: hasAddress && !canSeeAddress,
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
