import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { admins } from "@/db/schema";

/**
 * Contas de administrador do backoffice (só servidor — usa `node:crypto`
 * e a base de dados). Cria/atualiza contas com:
 *   npm run admin:setup -w @workspace/web
 * A password nunca é guardada em texto, só o hash scrypt
 * (`scrypt:<salt hex>:<hash hex>`).
 */

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

/** Conta ativa (não desativada) com este email, ou undefined. */
export async function findActiveAdminByEmail(email: string): Promise<AdminAccount | undefined> {
  const normalized = email.trim().toLowerCase();
  const [row] = await getDb()
    .select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      passwordHash: admins.passwordHash,
      // Lido aqui só para o login falhar logo (e avisar) se a base de dados
      // estiver desatualizada, em vez de entrar e voltar ao login.
      role: admins.role,
      disabledAt: admins.disabledAt,
    })
    .from(admins)
    .where(eq(admins.email, normalized))
    .limit(1);

  if (!row || row.disabledAt) return undefined;
  return { id: row.id, email: row.email, name: row.name, passwordHash: row.passwordHash };
}

// Gasta o mesmo tempo quando o email não existe, para a resposta não
// revelar que contas existem.
const DUMMY_SALT = randomBytes(16);

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminAccount | null> {
  const admin = await findActiveAdminByEmail(email);

  if (!admin) {
    await scryptAsync(password, DUMMY_SALT);
    return null;
  }

  const [scheme, saltHex, hashHex] = admin.passwordHash.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return null;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"));
  if (expected.length !== actual.length) return null;

  return timingSafeEqual(expected, actual) ? admin : null;
}
