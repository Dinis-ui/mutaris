#!/usr/bin/env node
/**
 * Preenche a base de dados com os dados de demonstração que hoje vivem em
 * `src/data/` (todos marcados `isDemo`). É seguro correr várias vezes: não
 * duplica linhas que já existem.
 *
 * Uso (a partir da raiz do projeto, depois de `db:migrate`):
 *   npm run db:seed -w @workspace/web
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema.ts";
import { products } from "../src/data/products.ts";
import { adminUsers } from "../src/data/backoffice-users.ts";
import { adminSupportTickets } from "../src/data/backoffice-support.ts";
import { adminOrders } from "../src/data/backoffice-orders.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não está definido em apps/web/.env.local");
  process.exit(1);
}

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

try {
  // Clientes
  await db
    .insert(schema.users)
    .values(
      adminUsers.map((user) => ({
        name: user.name,
        email: user.email,
        status: user.status,
        isDemo: user.isDemo,
        createdAt: new Date(user.createdAt),
      })),
    )
    .onConflictDoNothing();

  const userRows = await db.select().from(schema.users);
  const userIdByName = new Map(userRows.map((row) => [row.name, row.id]));

  // Produtos
  await db
    .insert(schema.products)
    .values(
      products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        description: product.description,
        priceCents: Math.round(product.price * 100),
        currency: product.currency,
        image: product.image ?? null,
        availability: product.availability,
        features: product.features,
        solutionIds: product.solutionIds,
        isDemo: product.isDemo,
      })),
    )
    .onConflictDoNothing();

  // Pedidos de suporte
  await db
    .insert(schema.supportTickets)
    .values(
      adminSupportTickets.map((ticket) => ({
        reference: ticket.reference,
        subject: ticket.subject,
        userId: userIdByName.get(ticket.customerName) ?? null,
        status: ticket.status,
        isDemo: ticket.isDemo,
        createdAt: new Date(ticket.createdAt),
      })),
    )
    .onConflictDoNothing();

  // Encomendas
  await db
    .insert(schema.orders)
    .values(
      adminOrders.map((order) => ({
        number: order.number,
        userId: userIdByName.get(order.customerName) ?? null,
        status: order.status,
        totalCents: Math.round(order.total * 100),
        itemCount: order.itemCount,
        isDemo: order.isDemo,
        createdAt: new Date(order.createdAt),
      })),
    )
    .onConflictDoNothing();

  const counts = {
    clientes: (await db.select().from(schema.users).where(eq(schema.users.isDemo, true))).length,
    produtos: (await db.select().from(schema.products)).length,
    suporte: (await db.select().from(schema.supportTickets)).length,
    encomendas: (await db.select().from(schema.orders)).length,
  };
  console.log("Seed concluído. Linhas na base de dados:", counts);
} finally {
  await client.end();
}
