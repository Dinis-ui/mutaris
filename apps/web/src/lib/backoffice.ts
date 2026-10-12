import { count, desc, eq, ne, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { orders, products, supportTickets, users } from "@/db/schema";
import {
  mockActivity,
  platformStatus,
  type ActivityItem,
  type PlatformStatusItem,
  type SummaryCardData,
} from "@/data/backoffice-dashboard";
import type { AdminSupportTicket } from "@/data/backoffice-support";
import type { AdminUser } from "@/data/backoffice-users";
import type { AdminOrder } from "@/data/backoffice-orders";

/**
 * Camada de dados do backoffice, ligada ao PostgreSQL (só servidor). Os
 * componentes chamam estas funções e recebem a mesma forma de dados de
 * antes (`AdminUser`, `AdminSupportTicket`, `AdminOrder`…), por isso não
 * dependem da base de dados diretamente.
 *
 * Ainda mockado: `getRecentActivity` (não existe registo de atividade).
 */

const REMOVED_CUSTOMER_LABEL = "Cliente removido";

export async function getDashboardSummary(): Promise<SummaryCardData[]> {
  await requireAdmin();
  const db = getDb();

  const [[userCount], [orderCount], [productCount], [openTicketCount]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(supportTickets).where(ne(supportTickets.status, "resolved")),
  ]);

  return [
    {
      id: "utilizadores",
      label: "Utilizadores",
      value: String(userCount?.value ?? 0),
      description: "Contas registadas na área de cliente.",
    },
    {
      id: "encomendas",
      label: "Encomendas",
      value: String(orderCount?.value ?? 0),
      description: "Total de encomendas registadas.",
    },
    {
      id: "produtos",
      label: "Produtos na loja",
      value: String(productCount?.value ?? 0),
      description: "Produtos atualmente no catálogo.",
    },
    {
      id: "suporte",
      label: "Suporte em aberto",
      value: String(openTicketCount?.value ?? 0),
      description: "Pedidos de suporte ainda sem resposta.",
    },
  ];
}

export function getRecentActivity(): ActivityItem[] {
  return mockActivity;
}

/** Estado da plataforma; a linha da base de dados é verificada a sério. */
export async function getPlatformStatus(): Promise<PlatformStatusItem[]> {
  await requireAdmin();
  let databaseItem: PlatformStatusItem;
  try {
    await getDb().execute(sql`select 1`);
    databaseItem = {
      id: "base-de-dados",
      label: "Base de dados",
      description: "Ligação ao PostgreSQL ativa.",
      tone: "positive",
    };
  } catch {
    databaseItem = {
      id: "base-de-dados",
      label: "Base de dados",
      description: "Sem ligação ao PostgreSQL — verifica DATABASE_URL.",
      tone: "attention",
    };
  }

  return platformStatus.map((item) => (item.id === "base-de-dados" ? databaseItem : item));
}

export async function getSupportTickets(): Promise<AdminSupportTicket[]> {
  await requireAdmin();
  const rows = await getDb()
    .select({
      id: supportTickets.id,
      reference: supportTickets.reference,
      subject: supportTickets.subject,
      status: supportTickets.status,
      createdAt: supportTickets.createdAt,
      isDemo: supportTickets.isDemo,
      userId: supportTickets.userId,
      customerName: users.name,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.createdAt));

  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    subject: row.subject,
    customerName: row.customerName ?? REMOVED_CUSTOMER_LABEL,
    userId: row.userId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    isDemo: row.isDemo,
  }));
}

export async function getUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const rows = await getDb().select().from(users).orderBy(desc(users.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    isDemo: row.isDemo,
  }));
}

export async function getOrders(): Promise<AdminOrder[]> {
  await requireAdmin();
  const rows = await getDb()
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      totalCents: orders.totalCents,
      itemCount: orders.itemCount,
      createdAt: orders.createdAt,
      isDemo: orders.isDemo,
      customerName: users.name,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    customerName: row.customerName ?? REMOVED_CUSTOMER_LABEL,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    total: row.totalCents / 100,
    itemCount: row.itemCount,
    isDemo: row.isDemo,
  }));
}
