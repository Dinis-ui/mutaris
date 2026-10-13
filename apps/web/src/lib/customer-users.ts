import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, spendPasswordTime, verifyPassword } from "@/lib/password-hash";

/** Registo e autenticação de clientes (só servidor). */

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
}

/** Cria a conta. Devolve null se já existir uma conta com este email. */
export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<CustomerAccount | null> {
  const passwordHash = await hashPassword(input.password);

  const [row] = await getDb()
    .insert(users)
    .values({
      name: input.name.trim(),
      email: input.email,
      passwordHash,
      // Ainda não há verificação de email: a conta fica ativa logo no registo.
      status: "active",
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id, name: users.name, email: users.email });

  return row ?? null;
}

export type AuthResult =
  | { status: "ok"; account: CustomerAccount }
  | { status: "suspended" }
  | { status: "invalid" };

export async function authenticateCustomer(email: string, password: string): Promise<AuthResult> {
  const [row] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      status: users.status,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!row || !row.passwordHash) {
    await spendPasswordTime(password);
    return { status: "invalid" };
  }

  if (!(await verifyPassword(password, row.passwordHash))) return { status: "invalid" };

  // Só revela que a conta está suspensa depois de a password estar certa.
  if (row.status === "suspended") return { status: "suspended" };

  return { status: "ok", account: { id: row.id, name: row.name, email: row.email } };
}
