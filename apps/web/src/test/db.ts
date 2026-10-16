import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb } from "@/db";
import { admins, products, supportTickets, orders, users } from "@/db/schema";
import type { AdminRole } from "@/lib/admin-permissions";
import { hashPassword } from "@/lib/password-hash";
import { createAdminSession } from "@/lib/backoffice-session-server";
import { cookieJar } from "@/test/next-mocks";
import { BACKOFFICE_SESSION_COOKIE } from "@/lib/backoffice-auth";

/**
 * Apoio aos testes com base de dados. Só correm se `TEST_DATABASE_URL`
 * estiver definido (senão são saltados, e `npm test` continua a funcionar
 * sem base de dados). ATENÇÃO: a base é APAGADA e recriada a cada execução,
 * por isso recusamos qualquer base cujo nome não contenha "test".
 */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

function assertSafeTestDatabase(url: string) {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.toLowerCase().includes("test")) {
    throw new Error(
      `TEST_DATABASE_URL aponta para "${name}". Por segurança, o nome da base de dados tem de conter "test".`,
    );
  }
}

/** Recria o esquema (migrações reais da pasta `drizzle/`) e liga o `getDb()` à base de testes. */
export async function setupTestDb() {
  if (!TEST_DATABASE_URL) throw new Error("TEST_DATABASE_URL não está definido.");
  assertSafeTestDatabase(TEST_DATABASE_URL);
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  const db = getDb();
  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`drop schema if exists drizzle cascade`);
  await db.execute(sql`create schema public`);
  await migrate(db, { migrationsFolder: "./drizzle" });
}

/** Apaga os dados (não o esquema) entre testes. */
export async function resetData() {
  await getDb().execute(
    sql`truncate table admin_sessions, user_sessions, admins, users, products, support_tickets, orders, login_failures, audit_log restart identity cascade`,
  );
  cookieJar.clear();
}

let counter = 0;

export async function createTestAdmin(role: AdminRole, overrides: { disabled?: boolean } = {}) {
  counter += 1;
  const [row] = await getDb()
    .insert(admins)
    .values({
      name: `Admin ${role} ${counter}`,
      email: `admin${counter}-${role}@teste.local`,
      passwordHash: await hashPassword("Teste-Teste-123!"),
      role,
      disabledAt: overrides.disabled ? new Date() : null,
    })
    .returning();
  return row!;
}

/** Cria uma sessão real para o administrador e põe o cookie no pedido simulado. */
export async function loginAs(adminId: string) {
  const token = await createAdminSession(adminId);
  cookieJar.set(BACKOFFICE_SESSION_COOKIE, token);
  return token;
}

export async function createTestUser(status: "active" | "suspended" | "pending" = "active") {
  counter += 1;
  const [row] = await getDb()
    .insert(users)
    .values({ name: `Cliente ${counter}`, email: `cliente${counter}@teste.local`, status })
    .returning();
  return row!;
}

export async function createTestTicket() {
  counter += 1;
  const [row] = await getDb()
    .insert(supportTickets)
    .values({ reference: `T-${counter}`, subject: "Teste" })
    .returning();
  return row!;
}

export async function createTestOrder() {
  counter += 1;
  const [row] = await getDb()
    .insert(orders)
    .values({ number: `E-${counter}`, totalCents: 1000 })
    .returning();
  return row!;
}

export async function createTestProduct() {
  counter += 1;
  const [row] = await getDb()
    .insert(products)
    .values({
      id: `p${counter}`,
      slug: `produto-${counter}`,
      name: `Produto ${counter}`,
      category: "camaras",
      description: "Teste",
      priceCents: 1000,
    })
    .returning();
  return row!;
}
