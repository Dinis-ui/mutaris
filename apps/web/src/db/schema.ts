import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Esquema da base de dados (PostgreSQL).
 *
 * Os valores dos enums seguem os tipos que a aplicação já usa
 * (`@workspace/types` e `data/backoffice-*.ts`), para a camada de dados
 * poder trocar os dados mockados pelos da base de dados sem alterar os
 * componentes. Preços ficam em cêntimos (inteiros) para evitar erros de
 * arredondamento.
 *
 * `isDemo` marca linhas de demonstração (as mesmas que hoje vivem em
 * `data/`) — nunca devem existir em produção.
 */

export const userStatus = pgEnum("user_status", ["active", "pending", "suspended"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "awaiting-reply", "resolved"]);
export const orderStatus = pgEnum("order_status", [
  "awaiting-payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const productAvailability = pgEnum("product_availability", [
  "disponivel",
  "sob-consulta",
  "brevemente",
]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

/** Contas de administrador do backoffice. `passwordHash`: scrypt:<salt>:<hash>. */
export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** Preenchido para desativar uma conta sem a apagar. */
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/**
 * Sessões do backoffice. O cookie guarda um token aleatório; aqui fica só o
 * hash SHA-256 dele, por isso uma fuga da base de dados não dá acesso. Apagar
 * a linha termina a sessão de imediato.
 */
export const adminSessions = pgTable("admin_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => admins.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

/**
 * Tentativas de login falhadas, para limitar tentativas (ver
 * `lib/backoffice-rate-limit.ts`). Guarda só o hash da chave (IP, ou IP +
 * email) — nunca o email nem o IP em texto.
 */
export const loginFailures = pgTable(
  "login_failures",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    keyHash: text("key_hash").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("login_failures_key_idx").on(table.keyHash, table.createdAt)],
);

/**
 * Registo de atividade do backoffice: uma linha por ação de administrador.
 * `actorName` fica copiado para o registo continuar legível se a conta do
 * administrador for removida. `action` é um código (ver `lib/audit-actions.ts`)
 * e `target` descreve sobre o quê (nome, referência, número…).
 */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => admins.id, { onDelete: "set null" }),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  target: text("target").default("").notNull(),
  createdAt: createdAt(),
});

/** Clientes da loja (contas da área de cliente). */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  /** Hash scrypt (`scrypt:<salt>:<hash>`). Vazio nas contas de demonstração: não podem entrar. */
  passwordHash: text("password_hash"),
  phone: text("phone"),
  status: userStatus("status").default("pending").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: createdAt(),
});

/**
 * Sessões dos clientes (mesmo esquema das do backoffice: o cookie guarda um
 * token aleatório e aqui fica só o hash SHA-256 dele).
 */
export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Slug de uma categoria (as categorias continuam em `data/product-categories.ts`). */
  category: text("category").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").default("EUR").notNull(),
  image: text("image"),
  availability: productAvailability("availability").default("disponivel").notNull(),
  features: text("features").array().default([]).notNull(),
  solutionIds: text("solution_ids").array().default([]).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: text("reference").notNull().unique(),
  subject: text("subject").notNull(),
  /** Tipo de pedido escolhido pelo cliente (ver `lib/support.ts`) e a mensagem. Vazios nos pedidos antigos/demo. */
  category: text("category"),
  message: text("message"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: ticketStatus("status").default("open").notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: orderStatus("status").default("awaiting-payment").notNull(),
  totalCents: integer("total_cents").notNull(),
  itemCount: integer("item_count").default(0).notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
  createdAt: createdAt(),
});
