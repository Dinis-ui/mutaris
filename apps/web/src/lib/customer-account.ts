import { randomBytes } from "node:crypto";
import { and, count, desc, eq, gt, inArray, ne } from "drizzle-orm";
import type { Order, SupportTicket } from "@workspace/types";
import { getDb } from "@/db";
import { orders, supportTickets, userSessions, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import type { SupportRequestInput } from "@/lib/support";

/**
 * Dados da conta do cliente (só servidor). Todas as funções recebem o `userId`
 * do cliente com sessão e filtram sempre por ele — um cliente nunca vê nem
 * altera dados de outro.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ----------------------------- Perfil ----------------------------- */

export interface CustomerProfileData {
  name: string;
  email: string;
  phone: string;
}

export async function getProfile(userId: string): Promise<CustomerProfileData | null> {
  const [row] = await getDb()
    .select({ name: users.name, email: users.email, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ? { name: row.name, email: row.email, phone: row.phone ?? "" } : null;
}

export async function updateProfile(
  userId: string,
  input: { name: string; phone: string },
): Promise<void> {
  await getDb()
    .update(users)
    .set({ name: input.name, phone: input.phone || null })
    .where(eq(users.id, userId));
}

/* --------------------------- Encomendas --------------------------- */

function toOrder(row: typeof orders.$inferSelect): Order {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    total: row.totalCents / 100,
    currency: "EUR",
    // As linhas de cada encomenda ainda não existem na base de dados.
    items: [],
  };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const rows = await getDb()
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return rows.map(toOrder);
}

/** Encomenda do cliente, ou null (também quando pertence a outra pessoa). */
export async function getUserOrder(userId: string, id: string): Promise<Order | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const [row] = await getDb()
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);
  return row ? toOrder(row) : null;
}

/* ----------------------------- Suporte ---------------------------- */

export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  const rows = await getDb()
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));
  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    subject: row.subject,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));
}

const TICKETS_PER_HOUR = 5;
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newReference(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `SUP-${code}`;
}

export type CreateTicketResult =
  | { status: "ok"; reference: string }
  | { status: "rate-limited" };

export async function createTicket(
  userId: string,
  input: SupportRequestInput,
): Promise<CreateTicketResult> {
  const db = getDb();

  // Limite simples contra spam: no máximo 5 pedidos por hora e por cliente.
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [recent] = await db
    .select({ value: count() })
    .from(supportTickets)
    .where(and(eq(supportTickets.userId, userId), gt(supportTickets.createdAt, since)));
  if ((recent?.value ?? 0) >= TICKETS_PER_HOUR) return { status: "rate-limited" };

  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = newReference();
    const [row] = await db
      .insert(supportTickets)
      .values({
        reference,
        subject: input.subject.trim(),
        category: input.category,
        message: input.message.trim(),
        userId,
        status: "open",
      })
      .onConflictDoNothing({ target: supportTickets.reference })
      .returning({ reference: supportTickets.reference });
    if (row) return { status: "ok", reference: row.reference };
  }
  throw new Error("Não foi possível gerar uma referência única.");
}

/* ---------------------------- Segurança --------------------------- */

export type ChangePasswordResult = "ok" | "wrong-current" | "no-password";

/** Muda a password e termina todas as outras sessões (mantém a atual). */
export async function changePassword(
  userId: string,
  current: string,
  next: string,
  keepSessionHash: string | null,
): Promise<ChangePasswordResult> {
  const db = getDb();
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.passwordHash) return "no-password";
  if (!(await verifyPassword(current, row.passwordHash))) return "wrong-current";

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.id, userId));
  await revokeOtherSessions(userId, keepSessionHash);
  return "ok";
}

export interface SessionInfo {
  id: string;
  createdAt: string;
  current: boolean;
}

export async function listSessions(
  userId: string,
  currentHash: string | null,
): Promise<SessionInfo[]> {
  const rows = await getDb()
    .select({
      id: userSessions.id,
      tokenHash: userSessions.tokenHash,
      createdAt: userSessions.createdAt,
    })
    .from(userSessions)
    .where(and(eq(userSessions.userId, userId), gt(userSessions.expiresAt, new Date())))
    .orderBy(desc(userSessions.createdAt));
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    current: row.tokenHash === currentHash,
  }));
}

/** Termina todas as sessões do cliente, exceto a atual. */
export async function revokeOtherSessions(
  userId: string,
  keepSessionHash: string | null,
): Promise<void> {
  const condition = keepSessionHash
    ? and(eq(userSessions.userId, userId), ne(userSessions.tokenHash, keepSessionHash))
    : eq(userSessions.userId, userId);
  await getDb().delete(userSessions).where(condition);
}

/* ------------------------- Eliminar conta ------------------------- */

/** Encomendas neste estado ainda não terminaram: não se pode eliminar a conta. */
const OPEN_ORDER_STATUSES = ["awaiting-payment", "processing", "shipped"] as const;

export type DeleteAccountResult = "ok" | "wrong-password" | "no-password" | "open-orders";

/**
 * Elimina a conta do cliente depois de confirmar a palavra-passe.
 * - Sessões: apagadas (em cascata).
 * - Pedidos de suporte: apagados (podem conter dados pessoais na mensagem).
 * - Encomendas: ficam, sem ligação à conta (`user_id` passa a nulo), porque os
 *   registos de encomendas/faturação têm de ser conservados por lei.
 * Tudo numa transação: ou fica tudo feito, ou nada.
 */
export async function deleteAccount(userId: string, password: string): Promise<DeleteAccountResult> {
  const db = getDb();
  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.passwordHash) return "no-password";
  if (!(await verifyPassword(password, row.passwordHash))) return "wrong-password";

  return db.transaction(async (tx) => {
    const [open] = await tx
      .select({ value: count() })
      .from(orders)
      .where(and(eq(orders.userId, userId), inArray(orders.status, [...OPEN_ORDER_STATUSES])));
    if ((open?.value ?? 0) > 0) return "open-orders" as const;

    await tx.delete(supportTickets).where(eq(supportTickets.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
    return "ok" as const;
  });
}
