import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { userSessions, users } from "@/db/schema";
import { CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth";

/**
 * Sessões dos clientes guardadas na base de dados (só servidor), com o mesmo
 * desenho das do backoffice: cookie com token aleatório, hash na BD, e cada
 * pedido valida a sessão — por isso suspender uma conta termina o acesso
 * de imediato.
 */

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: string): Promise<string> {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000);

  await db.insert(userSessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  await db.delete(userSessions).where(lt(userSessions.expiresAt, new Date()));

  return token;
}

export async function destroyUserSession(token: string): Promise<void> {
  await getDb().delete(userSessions).where(eq(userSessions.tokenHash, hashToken(token)));
}

/** Cliente com sessão válida e conta não suspensa (ou null). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const [row] = await getDb()
      .select({ id: users.id, name: users.name, email: users.email })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      .where(
        and(
          eq(userSessions.tokenHash, hashToken(token)),
          gt(userSessions.expiresAt, new Date()),
          ne(users.status, "suspended"),
        ),
      )
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
});

/** Exige cliente com sessão; senão, vai para o login. Chamar em cada página da área de cliente. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}
