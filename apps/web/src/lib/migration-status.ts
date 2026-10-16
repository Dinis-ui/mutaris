import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import journal from "../../drizzle/meta/_journal.json";

/**
 * Verifica se a base de dados tem todas as migrações da pasta `drizzle/`
 * (só servidor). Serve para explicar um erro — por exemplo, código novo à
 * frente da base de dados, em que uma coluna ainda não existe — em vez de
 * deixar o utilizador num ciclo de login sem pista do motivo.
 *
 * O drizzle guarda cada migração aplicada em `drizzle.__drizzle_migrations`
 * com a data (`created_at`) igual ao `when` do diário `drizzle/meta/_journal.json`.
 * Só usar depois de uma falha: uma base criada por outra via (sem esta tabela)
 * aparece como "por aplicar" mesmo estando certa.
 */
export type MigrationStatus =
  | { state: "ok" }
  | { state: "pending"; count: number }
  /** Não foi possível verificar (por exemplo, sem ligação à base de dados). */
  | { state: "unknown" };

const UNDEFINED_TABLE = "42P01";

function errorCode(error: unknown): string | undefined {
  const direct = (error as { code?: unknown } | null)?.code;
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  const code = typeof direct === "string" ? direct : cause;
  return typeof code === "string" ? code : undefined;
}

export function countPendingMigrations(
  appliedLatest: number | null,
  entries: readonly { when: number }[] = journal.entries,
): number {
  if (appliedLatest === null) return entries.length;
  return entries.filter((entry) => entry.when > appliedLatest).length;
}

export async function getMigrationStatus(): Promise<MigrationStatus> {
  try {
    const rows = await getDb().execute<{ latest: string | null }>(
      sql`select max(created_at)::text as latest from drizzle.__drizzle_migrations`,
    );
    const latest = rows[0]?.latest;
    const pending = countPendingMigrations(latest ? Number(latest) : null);
    return pending > 0 ? { state: "pending", count: pending } : { state: "ok" };
  } catch (error) {
    // Sem a tabela de migrações, nenhuma foi aplicada.
    if (errorCode(error) === UNDEFINED_TABLE) {
      return { state: "pending", count: journal.entries.length };
    }
    return { state: "unknown" };
  }
}
