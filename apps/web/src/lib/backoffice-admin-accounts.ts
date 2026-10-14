import { and, asc, count, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";
import { requireAdmin, revokeAdminSessions } from "@/lib/backoffice-session-server";
import { hashPassword, verifyPassword } from "@/lib/password-hash";

/**
 * Gestão de contas de administrador (só servidor). Todas as funções exigem
 * um administrador com sessão válida. As passwords só existem como hash scrypt.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  disabled: boolean;
  createdAt: string;
  /** True para a conta do administrador que está a ver a página. */
  isSelf: boolean;
}

export async function listAdmins(): Promise<AdminListItem[]> {
  const current = await requireAdmin();
  const rows = await getDb()
    .select({
      id: admins.id,
      name: admins.name,
      email: admins.email,
      disabledAt: admins.disabledAt,
      createdAt: admins.createdAt,
    })
    .from(admins)
    .orderBy(asc(admins.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    disabled: row.disabledAt !== null,
    createdAt: row.createdAt.toISOString(),
    isSelf: row.id === current.id,
  }));
}

export type CreateAdminResult = { ok: true; name: string } | { ok: false; error: string };

export async function createAdmin(input: {
  name: string;
  email: string;
  password: string;
}): Promise<CreateAdminResult> {
  await requireAdmin();
  const passwordHash = await hashPassword(input.password);

  const [row] = await getDb()
    .insert(admins)
    .values({ name: input.name, email: input.email, passwordHash })
    .onConflictDoNothing({ target: admins.email })
    .returning({ name: admins.name });

  if (!row) return { ok: false, error: "Já existe um administrador com este email." };
  return { ok: true, name: row.name };
}

export type SetDisabledResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

/** Desativa ou reativa um administrador. Desativar termina-lhe as sessões. */
export async function setAdminDisabled(id: string, disabled: boolean): Promise<SetDisabledResult> {
  const current = await requireAdmin();
  if (!UUID_PATTERN.test(id)) return { ok: false, error: "Administrador não encontrado." };

  const db = getDb();
  if (disabled) {
    if (id === current.id) {
      return { ok: false, error: "Não podes desativar a tua própria conta." };
    }
    // Tem de sobrar pelo menos um administrador ativo.
    const [others] = await db
      .select({ value: count() })
      .from(admins)
      .where(and(ne(admins.id, id), isNull(admins.disabledAt)));
    if ((others?.value ?? 0) < 1) {
      return { ok: false, error: "Tem de existir pelo menos um administrador ativo." };
    }
  }

  const [row] = await db
    .update(admins)
    .set({ disabledAt: disabled ? new Date() : null })
    .where(eq(admins.id, id))
    .returning({ name: admins.name });
  if (!row) return { ok: false, error: "Administrador não encontrado." };

  if (disabled) await revokeAdminSessions(id);
  return { ok: true, name: row.name };
}

/** Define uma password nova para outro administrador e termina-lhe as sessões. */
export async function resetAdminPassword(
  id: string,
  newPassword: string,
): Promise<SetDisabledResult> {
  await requireAdmin();
  if (!UUID_PATTERN.test(id)) return { ok: false, error: "Administrador não encontrado." };

  const [row] = await getDb()
    .update(admins)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(admins.id, id))
    .returning({ name: admins.name });
  if (!row) return { ok: false, error: "Administrador não encontrado." };

  await revokeAdminSessions(id);
  return { ok: true, name: row.name };
}

export type ChangeOwnPasswordResult = "ok" | "wrong-current";

/** O administrador muda a própria password; as outras sessões dele terminam. */
export async function changeOwnPassword(
  adminId: string,
  current: string,
  next: string,
  keepSessionHash: string | null,
): Promise<ChangeOwnPasswordResult> {
  const db = getDb();
  const [row] = await db
    .select({ passwordHash: admins.passwordHash })
    .from(admins)
    .where(eq(admins.id, adminId))
    .limit(1);
  if (!row || !(await verifyPassword(current, row.passwordHash))) return "wrong-current";

  await db
    .update(admins)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(admins.id, adminId));
  await revokeAdminSessions(adminId, keepSessionHash);
  return "ok";
}
