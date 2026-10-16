import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions, auditLog, loginFailures } from "@/db/schema";
import { cookieJar, jsonRequest } from "@/test/next-mocks";
import { TEST_DATABASE_URL, TEST_PASSWORD, createTestAdmin, loginAs, resetData, setupTestDb } from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { POST as login } from "@/app/api/backoffice-login/route";
import { POST as logout } from "@/app/api/backoffice-logout/route";
import { requireAdmin } from "@/lib/backoffice-session-server";

const COOKIE = "mutaris_backoffice_session";

describe.skipIf(!TEST_DATABASE_URL)("login e logout do backoffice (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  it("login certo: cria sessão, cookie seguro e fica registado", async () => {
    const admin = await createTestAdmin("support");
    const response = await login(jsonRequest({ email: admin.email.toUpperCase(), password: TEST_PASSWORD }));

    expect(response.status).toBe(200);
    const cookie = response.cookies.get(COOKIE);
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");

    expect(await getDb().select().from(adminSessions)).toHaveLength(1);
    const log = await getDb().select().from(auditLog);
    expect(log.map((row) => row.action)).toEqual(["admin.login"]);

    // De ponta a ponta: o cookie devolvido dá acesso, com o perfil certo.
    cookieJar.set(COOKIE, cookie!.value);
    expect(await requireAdmin("support")).toMatchObject({ id: admin.id, role: "support" });
  });

  it("palavra-passe errada: 401, sem cookie nem sessão, e a falha conta", async () => {
    const admin = await createTestAdmin("full");
    const response = await login(jsonRequest({ email: admin.email, password: "Errada-Errada-1!" }));

    expect(response.status).toBe(401);
    expect(response.cookies.get(COOKIE)).toBeUndefined();
    expect(await getDb().select().from(adminSessions)).toHaveLength(0);
    expect(await getDb().select().from(loginFailures)).not.toHaveLength(0);
  });

  it("email inexistente tem a mesma resposta que palavra-passe errada", async () => {
    const admin = await createTestAdmin("full");
    const wrongPassword = await login(jsonRequest({ email: admin.email, password: "Errada-Errada-1!" }));
    const unknownEmail = await login(jsonRequest({ email: "ninguem@teste.local", password: "Errada-Errada-1!" }));

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(await unknownEmail.json()).toEqual(await wrongPassword.json());
  });

  it("administrador desativado não entra", async () => {
    const admin = await createTestAdmin("full", { disabled: true });
    const response = await login(jsonRequest({ email: admin.email, password: TEST_PASSWORD }));
    expect(response.status).toBe(401);
    expect(await getDb().select().from(adminSessions)).toHaveLength(0);
  });

  it("pedido sem email ou palavra-passe: 400", async () => {
    expect((await login(jsonRequest({ email: "a@teste.local" }))).status).toBe(400);
    expect((await login(jsonRequest({ password: "x" }))).status).toBe(400);
    expect((await login(jsonRequest("isto não é json"))).status).toBe(400);
  });

  it("à 5.ª falha bloqueia (429), mesmo com a palavra-passe certa", async () => {
    const admin = await createTestAdmin("full");
    for (let i = 0; i < 5; i++) {
      await login(jsonRequest({ email: admin.email, password: "Errada-Errada-1!" }));
    }
    const response = await login(jsonRequest({ email: admin.email, password: TEST_PASSWORD }));
    expect(response.status).toBe(429);
    expect(await getDb().select().from(adminSessions)).toHaveLength(0);
  });

  it("login com sucesso limpa as falhas desse email", async () => {
    const admin = await createTestAdmin("full");
    for (let i = 0; i < 3; i++) {
      await login(jsonRequest({ email: admin.email, password: "Errada-Errada-1!" }));
    }
    expect((await login(jsonRequest({ email: admin.email, password: TEST_PASSWORD }))).status).toBe(200);
    // Se as falhas não tivessem sido limpas, mais 2 erradas bloqueariam à 5.ª.
    for (let i = 0; i < 2; i++) {
      await login(jsonRequest({ email: admin.email, password: "Errada-Errada-1!" }));
    }
    expect((await login(jsonRequest({ email: admin.email, password: TEST_PASSWORD }))).status).toBe(200);
  });

  it("logout apaga a sessão, limpa o cookie e fica registado", async () => {
    const admin = await createTestAdmin("full");
    await loginAs(admin.id);

    const response = await logout();

    expect(response.status).toBe(200);
    expect(response.cookies.get(COOKIE)?.value).toBe("");
    expect(await getDb().select().from(adminSessions).where(eq(adminSessions.adminId, admin.id))).toHaveLength(0);
    const log = await getDb().select().from(auditLog);
    expect(log.map((row) => row.action)).toContain("admin.logout");
  });
});
