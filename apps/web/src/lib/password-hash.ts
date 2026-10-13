import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Hash de passwords com scrypt (só servidor). Formato guardado:
 * `scrypt:<salt hex>:<hash hex>` — o mesmo das contas de administrador.
 */

const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"));
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

// Gasta o mesmo tempo quando a conta não existe, para a resposta não
// revelar que emails estão registados.
const DUMMY_SALT = randomBytes(16);

export async function spendPasswordTime(password: string): Promise<void> {
  await scryptAsync(password, DUMMY_SALT);
}
