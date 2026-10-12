#!/usr/bin/env node
/**
 * Cria ou atualiza uma conta de administrador do backoffice na base de
 * dados (tabela `admins`). A password nunca é guardada em texto — só o hash
 * scrypt (mesmo formato que lib/backoffice-admins.ts).
 *
 * Uso (a partir da raiz do projeto):
 *   npm run admin:setup -w @workspace/web
 *
 * Importar as contas antigas de BACKOFFICE_ADMINS (.env.local), sem pedir
 * passwords (os hashes mantêm-se):
 *   npm run admin:setup -w @workspace/web -- --from-env
 */
import { randomBytes, scrypt } from "node:crypto";
import readline from "node:readline";
import postgres from "postgres";

const MIN_PASSWORD_LENGTH = 12;
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não está definido em apps/web/.env.local.");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });

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

async function upsertAdmin({ email, name, passwordHash }) {
  await sql`
    insert into admins (email, name, password_hash)
    values (${email}, ${name}, ${passwordHash})
    on conflict (email) do update
      set name = excluded.name,
          password_hash = excluded.password_hash,
          disabled_at = null
  `;
}

try {
  if (process.argv.includes("--from-env")) {
    let accounts = [];
    try {
      accounts = JSON.parse((process.env.BACKOFFICE_ADMINS ?? "[]").replace(/^'|'$/g, ""));
    } catch {
      accounts = [];
    }
    const valid = accounts.filter(
      (a) => typeof a?.email === "string" && typeof a?.name === "string" && typeof a?.passwordHash === "string",
    );
    if (valid.length === 0) {
      console.error("Não encontrei contas em BACKOFFICE_ADMINS.");
      process.exit(1);
    }
    for (const a of valid) {
      await upsertAdmin({ email: a.email.trim().toLowerCase(), name: a.name, passwordHash: a.passwordHash });
      console.log(`Importado: ${a.email}`);
    }
    console.log("\nFeito. Já podes remover BACKOFFICE_ADMINS e BACKOFFICE_SESSION_SECRET do .env.local.");
  } else {
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

    await upsertAdmin({ email, name, passwordHash: await hashPassword(password) });
    console.log(`\nConta guardada para ${email}.`);
  }
} catch (error) {
  console.error("Falhou:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
