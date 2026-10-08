/**
 * Sessões do backoffice (compatível com o runtime do middleware: só usa
 * Web Crypto, nada de `node:crypto`).
 *
 * A sessão é um cookie httpOnly com `expiração:email` assinado com
 * HMAC-SHA256 usando BACKOFFICE_SESSION_SECRET. Não guarda nada no
 * servidor — por isso não há como revogar uma sessão individual antes de
 * expirar (a não ser mudar o segredo, o que termina todas). Quando
 * existir base de dados, isto deve passar a sessões guardadas no servidor.
 *
 * As contas de administrador e a verificação de passwords estão em
 * `lib/backoffice-admins.ts`.
 */

export const BACKOFFICE_SESSION_COOKIE = "mutaris_backoffice_session";
export const BACKOFFICE_SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret(): string | null {
  const secret = process.env.BACKOFFICE_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toHex(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True quando existe um segredo de sessão válido (>= 32 caracteres). */
export function isSessionConfigured(): boolean {
  return getSecret() !== null;
}

export async function createSessionToken(email: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + BACKOFFICE_SESSION_MAX_AGE;
  const payload = toHex(encoder.encode(`${expiresAt}:${email}`));
  return `${payload}.${await sign(secret, payload)}`;
}

/** Devolve o email da sessão se o token for válido e não tiver expirado. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<{ email: string } | null> {
  const secret = getSecret();
  if (!secret || !token) return null;

  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = await sign(secret, payload);
  if (!safeEqual(signature, expected)) return null;

  const bytes = fromHex(payload);
  if (!bytes) return null;
  const decoded = decoder.decode(bytes);
  const separator = decoded.indexOf(":");
  if (separator === -1) return null;

  const expiresAt = Number(decoded.slice(0, separator));
  const email = decoded.slice(separator + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return null;

  return { email };
}
