#!/usr/bin/env node
/**
 * Cria ou atualiza uma conta de administrador do backoffice em
 * apps/web/.env.local (BACKOFFICE_ADMINS) e garante que existe um
 * BACKOFFICE_SESSION_SECRET. A password nunca é guardada em texto — só o
 * hash scrypt (mesmo formato que lib/backoffice-admins.ts).
 *
 * Uso (a partir da raiz do projeto):
 *   node apps/web/scripts/setup-admin.mjs
 */
import { randomBytes, scrypt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";

const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
const MIN_PASSWORD_LENGTH = 12;

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    const originalWrite = rl._writeToOutput.bind(rl);
    rl._writeToOutput = (text) => {
      if (!muted) originalWrite(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
    if (hidden) muted = true;
  });
}

function hashPassword(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(`scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
    });
  });
}

function readEnv() {
  const lines = existsSync(envPath) ? readFileSync(envPath, "utf8").split(/\r?\n/) : [];
  const entries = new Map();
  const others = [];
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && (match[1] === "BACKOFFICE_ADMINS" || match[1] === "BACKOFFICE_SESSION_SECRET")) {
      entries.set(match[1], match[2]);
    } else if (line.trim() !== "") {
      others.push(line);
    }
  }
  return { entries, others };
}

const email = (await ask("Email do administrador: ")).trim().toLowerCase();
const name = (await ask("Nome (como aparece no backoffice): ")).trim();
if (!email.includes("@") || !name) {
  console.error("Email ou nome inválido.");
  process.exit(1);
}

const password = await ask(`Password (mínimo ${MIN_PASSWORD_LENGTH} caracteres): `, { hidden: true });
const confirmation = await ask("Repete a password: ", { hidden: true });
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`A password tem de ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  process.exit(1);
}
if (password !== confirmation) {
  console.error("As passwords não coincidem.");
  process.exit(1);
}

const { entries, others } = readEnv();

let admins = [];
try {
  const raw = entries.get("BACKOFFICE_ADMINS");
  if (raw) admins = JSON.parse(raw.replace(/^'|'$/g, ""));
} catch {
  admins = [];
}
admins = admins.filter((admin) => admin.email?.toLowerCase() !== email);
admins.push({ email, name, passwordHash: await hashPassword(password) });

const secretCurrent = entries.get("BACKOFFICE_SESSION_SECRET");
const secret = secretCurrent && secretCurrent.length >= 32 ? secretCurrent : randomBytes(32).toString("hex");

const content = [
  ...others,
  `BACKOFFICE_SESSION_SECRET=${secret}`,
  `BACKOFFICE_ADMINS='${JSON.stringify(admins)}'`,
  "",
].join("\n");

writeFileSync(envPath, content, "utf8");
console.log(`\nConta guardada para ${email} em ${envPath}`);
console.log("Reinicia o servidor de desenvolvimento (Ctrl+C e npm run dev) para aplicar.");
