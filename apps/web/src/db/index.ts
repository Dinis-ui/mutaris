import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

/**
 * Ligação à base de dados (só para código de servidor). A ligação é criada
 * à primeira utilização — assim, páginas que não usam a base de dados não
 * falham se `DATABASE_URL` não estiver definido.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { __mutarisDb?: Db };

export function getDb(): Db {
  if (globalForDb.__mutarisDb) return globalForDb.__mutarisDb;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não está definido. Acrescenta-o a apps/web/.env.local (ver .env.example).",
    );
  }

  // `prepare: false` é necessário quando a ligação passa por um pooler
  // (como o do Neon). O cache em `globalThis` evita abrir ligações novas a
  // cada recarga em desenvolvimento.
  const client = postgres(url, { prepare: false, max: 5 });
  globalForDb.__mutarisDb = drizzle(client, { schema });
  return globalForDb.__mutarisDb;
}
