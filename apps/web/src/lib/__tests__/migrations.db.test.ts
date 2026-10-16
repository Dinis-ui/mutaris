import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { is, sql } from "drizzle-orm";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import journal from "../../../drizzle/meta/_journal.json";
import { getMigrationStatus } from "@/lib/migration-status";
import { TEST_DATABASE_URL, setupTestDb } from "@/test/db";

describe.skipIf(!TEST_DATABASE_URL)("migrações (com base de dados)", () => {
  beforeAll(setupTestDb);
  // Estes testes estragam o registo de migrações: voltar a criar tudo no fim.
  afterAll(setupTestDb);

  it("schema.ts e as migrações estão alinhados: todas as colunas existem na base de dados", async () => {
    // Apanha o esquecimento de correr `npm run db:generate` depois de mexer em schema.ts.
    const tables = Object.values(schema).flatMap((value) => (is(value, PgTable) ? [value] : []));
    expect(tables.length).toBeGreaterThan(0);

    const missing: string[] = [];
    for (const table of tables) {
      const config = getTableConfig(table);
      const rows = await getDb().execute<{ column_name: string }>(
        sql`select column_name from information_schema.columns
            where table_schema = 'public' and table_name = ${config.name}`,
      );
      const existing = new Set(rows.map((row) => row.column_name));
      for (const column of config.columns) {
        if (!existing.has(column.name)) missing.push(`${config.name}.${column.name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("com todas as migrações aplicadas, o estado é ok", async () => {
    expect(await getMigrationStatus()).toEqual({ state: "ok" });
  });

  it("falta a última migração: fica 1 por aplicar", async () => {
    await getDb().execute(
      sql`delete from drizzle.__drizzle_migrations
          where created_at = (select max(created_at) from drizzle.__drizzle_migrations)`,
    );
    expect(await getMigrationStatus()).toEqual({ state: "pending", count: 1 });
  });

  it("sem tabela de migrações, estão todas por aplicar", async () => {
    await getDb().execute(sql`drop table drizzle.__drizzle_migrations`);
    expect(await getMigrationStatus()).toEqual({
      state: "pending",
      count: journal.entries.length,
    });
  });
});
