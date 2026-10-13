import { createHash } from "node:crypto";
import { and, count, eq, gt, inArray, lt } from "drizzle-orm";
import { getDb } from "@/db";
import { loginFailures } from "@/db/schema";

/**
 * Limite de tentativas de login, guardado na base de dados (por isso
 * aguenta reinícios e várias instâncias do servidor).
 *
 * Duas regras, numa janela de 15 minutos:
 *  - 5 falhas para o mesmo IP + email;
 *  - 20 falhas do mesmo IP (qualquer email).
 *
 * Guardamos só o hash das chaves. O IP vem do cabeçalho
 * `x-forwarded-for`, que só é de confiança atrás de um proxy que o defina
 * (como a Vercel).
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_PAIR = 5;
const MAX_FAILURES_PER_IP = 20;

/** Cada âmbito tem os seus próprios contadores (admins, clientes, registos). */
export type AttemptScope = "admin" | "customer" | "register";

export interface LoginAttempt {
  ip: string;
  email: string;
  scope?: AttemptScope;
}

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function keysFor({ ip, email, scope = "admin" }: LoginAttempt) {
  return { pair: hashKey(`pair|${scope}|${ip}|${email}`), ip: hashKey(`ip|${scope}|${ip}`) };
}

async function countSince(keyHash: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [row] = await getDb()
    .select({ value: count() })
    .from(loginFailures)
    .where(and(eq(loginFailures.keyHash, keyHash), gt(loginFailures.createdAt, since)));
  return row?.value ?? 0;
}

export async function isRateLimited(attempt: LoginAttempt): Promise<boolean> {
  const keys = keysFor(attempt);
  const [pairFailures, ipFailures] = await Promise.all([
    countSince(keys.pair),
    countSince(keys.ip),
  ]);
  return pairFailures >= MAX_FAILURES_PER_PAIR || ipFailures >= MAX_FAILURES_PER_IP;
}

export async function registerFailure(attempt: LoginAttempt): Promise<void> {
  const keys = keysFor(attempt);
  const db = getDb();
  await db.insert(loginFailures).values([{ keyHash: keys.pair }, { keyHash: keys.ip }]);
  // Limpeza oportunista das falhas já fora da janela.
  await db.delete(loginFailures).where(lt(loginFailures.createdAt, new Date(Date.now() - WINDOW_MS)));
}

/** Um login com sucesso limpa as falhas do par IP + email (não as do IP). */
export async function clearFailures(attempt: LoginAttempt): Promise<void> {
  const keys = keysFor(attempt);
  await getDb().delete(loginFailures).where(inArray(loginFailures.keyHash, [keys.pair]));
}
