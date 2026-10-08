import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Contas de administrador do backoffice (só corre no servidor — usa
 * `node:crypto`, por isso não pode ser importado pelo middleware).
 *
 * Enquanto não existe base de dados, as contas vivem na variável de
 * ambiente BACKOFFICE_ADMINS (JSON), com a password guardada como hash
 * scrypt — nunca em texto. Cria/atualiza contas com:
 *   node apps/web/scripts/setup-admin.mjs
 * Quando houver PostgreSQL, só `loadAdmins()` precisa de mudar.
 */

export interface AdminAccount {
  email: string;
  name: string;
  /** Formato: scrypt:<salt hex>:<hash hex> */
  passwordHash: string;
}

const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export function loadAdmins(): AdminAccount[] {
  const raw = process.env.BACKOFFICE_ADMINS;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AdminAccount =>
        typeof item?.email === "string" &&
        typeof item?.name === "string" &&
        typeof item?.passwordHash === "string",
    );
  } catch {
    return [];
  }
}

export function hasConfiguredAdmins(): boolean {
  return loadAdmins().length > 0;
}

export function findAdminByEmail(email: string): AdminAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return loadAdmins().find((admin) => admin.email.toLowerCase() === normalized);
}

// Usado para gastar o mesmo tempo quando o email não existe, para a
// resposta não revelar que contas existem.
const DUMMY_SALT = randomBytes(16);

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<AdminAccount | null> {
  const admin = findAdminByEmail(email);

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
