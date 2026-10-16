import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { cookieJar, jsonRequest } from "@/test/next-mocks";
import { TEST_DATABASE_URL, TEST_PASSWORD, createTestAdmin, loginAs, setupTestDb } from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { POST as backofficeLogin } from "@/app/api/backoffice-login/route";
import { requireAdmin } from "@/lib/backoffice-session-server";

/**
 * Reproduz o problema real: o código já usa a coluna `admins.role`, mas a base
 * de dados ainda não foi migrada. Antes, o utilizador entrava e voltava ao
 * login em ciclo, sem explicação.
 */
describe.skipIf(!TEST_DATABASE_URL)("base de dados desatualizada (com base de dados)", () => {
  beforeAll(setupTestDb);
  // Cada teste estraga o esquema: recriar tudo antes de cada um.
  beforeEach(setupTestDb);
  afterAll(setupTestDb);

  async function makeDatabaseStale() {
    await getDb().execute(sql`alter table admins drop column role`);
    await getDb().execute(
      sql`delete from drizzle.__drizzle_migrations
          where created_at = (select max(created_at) from drizzle.__drizzle_migrations)`,
    );
  }

  it("o login falha com uma mensagem clara (e não entra em ciclo)", async () => {
    const admin = await createTestAdmin("full");
    await makeDatabaseStale();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await backofficeLogin(jsonRequest({ email: admin.email, password: TEST_PASSWORD }));

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toContain("migrações por aplicar");
    expect(response.cookies.get("mutaris_backoffice_session")).toBeUndefined();
    errorLog.mockRestore();
  });

  it("com sessão já criada, requireAdmin vai para 'indisponível' e não para o login", async () => {
    const admin = await createTestAdmin("full");
    await loginAs(admin.id);
    await makeDatabaseStale();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/backoffice/indisponivel");
    expect(errorLog).toHaveBeenCalled(); // o motivo fica no log do servidor
    errorLog.mockRestore();
  });

  it("sem sessão continua a ir para o login", async () => {
    cookieJar.clear();
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/backoffice/login");
  });
});
