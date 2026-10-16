import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, isNull, lt, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions, admins } from "@/db/schema";
import { roleHasPermission, type AdminPermission, type AdminRole } from "@/lib/admin-permissions";
import { BACKOFFICE_SESSION_COOKIE, BACKOFFICE_SESSION_MAX_AGE } from "@/lib/backoffice-auth";

/**
 * Sessões do backoffice guardadas na base de dados (só servidor).
 *
 * O cookie tem um token aleatório de 256 bits; na base de dados fica o
 * hash SHA-256. Cada pedido valida a sessão na base de dados, por isso
 * terminar a sessão (ou desativar o administrador) tem efeito imediato.
 */

export interface CurrentAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Cria uma sessão para o administrador e devolve o token para o cookie. */
export async function createAdminSession(adminId: string): Promise<string> {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + BACKOFFICE_SESSION_MAX_AGE * 1000);

  await db.insert(adminSessions).values({ adminId, tokenHash: hashToken(token), expiresAt });
  // Limpeza oportunista das sessões já expiradas.
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));

  return token;
}

/** Hash do token da sessão atual (para a distinguir das outras), ou null. */
export async function getCurrentAdminSessionHash(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(BACKOFFICE_SESSION_COOKIE)?.value;
  return token ? hashToken(token) : null;
}

/** Termina todas as sessões de um administrador (menos a indicada, se houver). */
export async function revokeAdminSessions(
  adminId: string,
  keepSessionHash: string | null = null,
): Promise<void> {
  const condition = keepSessionHash
    ? and(eq(adminSessions.adminId, adminId), ne(adminSessions.tokenHash, keepSessionHash))
    : eq(adminSessions.adminId, adminId);
  await getDb().delete(adminSessions).where(condition);
}

/** Termina a sessão deste token (se existir). */
export async function destroyAdminSession(token: string): Promise<void> {
  await getDb().delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
}

type AdminLookup =
  | { status: "ok"; admin: CurrentAdmin }
  | { status: "none" }
  | { status: "error" };

/**
 * Procura o administrador da sessão atual, distinguindo "sem sessão válida"
 * de "erro ao consultar a base de dados". Em cache durante o mesmo pedido.
 */
const lookupAdmin = cache(async (): Promise<AdminLookup> => {
  const store = await cookies();
  const token = store.get(BACKOFFICE_SESSION_COOKIE)?.value;
  if (!token) return { status: "none" };

  try {
    const [row] = await getDb()
      .select({ id: admins.id, email: admins.email, name: admins.name, role: admins.role })
      .from(adminSessions)
      .innerJoin(admins, eq(admins.id, adminSessions.adminId))
      .where(
        and(
          eq(adminSessions.tokenHash, hashToken(token)),
          gt(adminSessions.expiresAt, new Date()),
          isNull(admins.disabledAt),
        ),
      )
      .limit(1);
    return row ? { status: "ok", admin: row } : { status: "none" };
  } catch (error) {
    // Fica no log do servidor (Vercel → Logs) para se perceber o motivo, por
    // exemplo uma migração por aplicar.
    console.error("Não foi possível validar a sessão do backoffice:", error);
    return { status: "error" };
  }
});

/**
 * Administrador com sessão válida (ou null). Valida na base de dados:
 * sessão existente, não expirada e conta não desativada. Sem base de dados
 * não há sessão válida (devolve null).
 */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const result = await lookupAdmin();
  return result.status === "ok" ? result.admin : null;
}

/**
 * Exige um administrador com sessão válida; senão, redireciona para o
 * login. Se a base de dados falhar (por exemplo, migração por aplicar),
 * redireciona para a página "indisponível" — e não para o login, que
 * ficaria num ciclo sem explicação. Com `permission`, exige também que o
 * perfil a inclua; senão, redireciona para "sem permissão". Deve ser
 * chamada junto dos dados (não depender só do middleware, nem do layout —
 * que não volta a correr em navegação).
 */
export async function requireAdmin(permission: AdminPermission = "view"): Promise<CurrentAdmin> {
  const result = await lookupAdmin();
  if (result.status === "error") redirect("/backoffice/indisponivel");
  if (result.status === "none") redirect("/backoffice/login");
  if (!roleHasPermission(result.admin.role, permission)) redirect("/backoffice/sem-permissao");
  return result.admin;
}
