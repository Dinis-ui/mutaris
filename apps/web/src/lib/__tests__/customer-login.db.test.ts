import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userSessions, users } from "@/db/schema";
import { cookieJar, jsonRequest } from "@/test/next-mocks";
import { TEST_DATABASE_URL, TEST_PASSWORD, createTestUser, resetData, setupTestDb } from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { POST as login } from "@/app/api/conta-entrar/route";
import { POST as register } from "@/app/api/conta-registar/route";
import { POST as logout } from "@/app/api/conta-sair/route";
import { getCurrentUser } from "@/lib/customer-session-server";

const COOKIE = "mutaris_session";
const NEW_ACCOUNT = {
  name: "Maria Teste",
  email: "maria@teste.local",
  password: TEST_PASSWORD,
  acceptTerms: true,
};

describe.skipIf(!TEST_DATABASE_URL)("login, registo e logout de clientes (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  describe("registo", () => {
    it("cria a conta, entra logo e guarda a palavra-passe só como hash", async () => {
      const response = await register(jsonRequest(NEW_ACCOUNT));

      expect(response.status).toBe(201);
      const cookie = response.cookies.get(COOKIE);
      expect(cookie?.httpOnly).toBe(true);

      const [created] = await getDb().select().from(users);
      expect(created?.email).toBe("maria@teste.local");
      expect(created?.passwordHash).toMatch(/^scrypt:/);
      expect(created?.passwordHash).not.toContain(TEST_PASSWORD);

      cookieJar.set(COOKIE, cookie!.value);
      expect(await getCurrentUser()).toMatchObject({ email: "maria@teste.local" });
    });

    it("normaliza o email (maiúsculas e espaços)", async () => {
      await register(jsonRequest({ ...NEW_ACCOUNT, email: "  MARIA@Teste.LOCAL " }));
      const [created] = await getDb().select().from(users);
      expect(created?.email).toBe("maria@teste.local");
    });

    it("email repetido: 409 e não cria outra conta", async () => {
      await register(jsonRequest(NEW_ACCOUNT, "10.0.0.1"));
      const again = await register(jsonRequest(NEW_ACCOUNT, "10.0.0.2"));
      expect(again.status).toBe(409);
      expect(await getDb().select().from(users)).toHaveLength(1);
    });

    it("recusa dados inválidos: palavra-passe fraca, sem aceitar os termos, email mau", async () => {
      expect((await register(jsonRequest({ ...NEW_ACCOUNT, password: "fraca" }))).status).toBe(400);
      expect((await register(jsonRequest({ ...NEW_ACCOUNT, acceptTerms: false }))).status).toBe(400);
      expect((await register(jsonRequest({ ...NEW_ACCOUNT, email: "nao-e-email" }))).status).toBe(400);
      expect(await getDb().select().from(users)).toHaveLength(0);
    });

    it("limita tentativas de registo repetidas (429)", async () => {
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) statuses.push((await register(jsonRequest(NEW_ACCOUNT))).status);
      expect(statuses.at(-1)).toBe(429);
    });
  });

  describe("login", () => {
    it("login certo cria sessão e cookie", async () => {
      const user = await createTestUser("active");
      const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));

      expect(response.status).toBe(200);
      expect(response.cookies.get(COOKIE)?.value).toBeTruthy();
      expect(await getDb().select().from(userSessions)).toHaveLength(1);
    });

    it("palavra-passe errada: 401, sem sessão", async () => {
      const user = await createTestUser("active");
      const response = await login(jsonRequest({ email: user.email, password: "Errada-Errada-1!" }));
      expect(response.status).toBe(401);
      expect(response.cookies.get(COOKIE)).toBeUndefined();
      expect(await getDb().select().from(userSessions)).toHaveLength(0);
    });

    it("email inexistente tem a mesma resposta que palavra-passe errada", async () => {
      const user = await createTestUser("active");
      const wrongPassword = await login(jsonRequest({ email: user.email, password: "Errada-Errada-1!" }));
      const unknownEmail = await login(jsonRequest({ email: "ninguem@teste.local", password: "Errada-Errada-1!" }));
      expect(unknownEmail.status).toBe(wrongPassword.status);
      expect(await unknownEmail.json()).toEqual(await wrongPassword.json());
    });

    it("conta suspensa não entra (403)", async () => {
      const user = await createTestUser("suspended");
      const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));
      expect(response.status).toBe(403);
      expect(await getDb().select().from(userSessions)).toHaveLength(0);
    });

    it("suspender uma conta com sessão ativa bloqueia o acesso de imediato", async () => {
      const user = await createTestUser("active");
      const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));
      cookieJar.set(COOKIE, response.cookies.get(COOKIE)!.value);
      expect(await getCurrentUser()).not.toBeNull();

      await getDb().update(users).set({ status: "suspended" }).where(eq(users.id, user.id));
      expect(await getCurrentUser()).toBeNull();
    });

    it("conta de demonstração (sem palavra-passe) não entra", async () => {
      const user = await createTestUser("active");
      await getDb().update(users).set({ passwordHash: null }).where(eq(users.id, user.id));
      const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));
      expect(response.status).toBe(401);
    });

    it("à 5.ª falha bloqueia (429), mesmo com a palavra-passe certa", async () => {
      const user = await createTestUser("active");
      for (let i = 0; i < 5; i++) {
        await login(jsonRequest({ email: user.email, password: "Errada-Errada-1!" }));
      }
      const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));
      expect(response.status).toBe(429);
    });

    it("pedido sem campos: 400", async () => {
      expect((await login(jsonRequest({ email: "a@teste.local" }))).status).toBe(400);
      expect((await login(jsonRequest({ email: "a@teste.local", password: "x".repeat(500) }))).status).toBe(400);
    });
  });

  it("logout apaga a sessão e limpa o cookie", async () => {
    const user = await createTestUser("active");
    const response = await login(jsonRequest({ email: user.email, password: TEST_PASSWORD }));
    cookieJar.set(COOKIE, response.cookies.get(COOKIE)!.value);

    const out = await logout();

    expect(out.cookies.get(COOKIE)?.value).toBe("");
    expect(await getDb().select().from(userSessions)).toHaveLength(0);
  });
});
