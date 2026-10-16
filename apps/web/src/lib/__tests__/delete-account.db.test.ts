import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, supportTickets, userSessions, users } from "@/db/schema";
import { cookieJar } from "@/test/next-mocks";
import {
  TEST_DATABASE_URL,
  TEST_PASSWORD,
  createTestOrder,
  createTestTicket,
  createTestUser,
  loginAsCustomer,
  resetData,
  setupTestDb,
} from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { deleteAccountAction } from "@/app/conta/actions";
import { deleteAccount } from "@/lib/customer-account";

describe.skipIf(!TEST_DATABASE_URL)("eliminar conta de cliente (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  it("com a palavra-passe certa apaga a conta, as sessões e os pedidos de suporte", async () => {
    const user = await createTestUser();
    await createTestTicket(user.id);
    await loginAsCustomer(user.id);

    expect(await deleteAccountAction({ password: TEST_PASSWORD })).toMatchObject({ ok: true });

    expect(cookieJar.has("mutaris_session")).toBe(false);
    expect(await getDb().select().from(users)).toHaveLength(0);
    expect(await getDb().select().from(userSessions)).toHaveLength(0);
    expect(await getDb().select().from(supportTickets)).toHaveLength(0);
  });

  it("as encomendas ficam, sem ligação à conta", async () => {
    const user = await createTestUser();
    const order = await createTestOrder(user.id, "delivered");

    expect(await deleteAccount(user.id, TEST_PASSWORD)).toBe("ok");

    const [kept] = await getDb().select().from(orders).where(eq(orders.id, order.id));
    expect(kept).toBeDefined();
    expect(kept?.userId).toBeNull();
  });

  it("com a palavra-passe errada não apaga nada", async () => {
    const user = await createTestUser();
    await createTestTicket(user.id);
    await loginAsCustomer(user.id);

    expect(await deleteAccountAction({ password: "Errada-Errada-1!" })).toMatchObject({ ok: false });

    expect(await getDb().select().from(users)).toHaveLength(1);
    expect(await getDb().select().from(supportTickets)).toHaveLength(1);
  });

  it("sem palavra-passe é recusado", async () => {
    const user = await createTestUser();
    await loginAsCustomer(user.id);
    expect(await deleteAccountAction({ password: "" })).toMatchObject({ ok: false });
    expect(await getDb().select().from(users)).toHaveLength(1);
  });

  it("com encomendas em curso não se pode eliminar", async () => {
    const user = await createTestUser();
    await createTestOrder(user.id, "processing");

    expect(await deleteAccount(user.id, TEST_PASSWORD)).toBe("open-orders");
    expect(await getDb().select().from(users)).toHaveLength(1);
  });

  it("encomendas canceladas não impedem a eliminação", async () => {
    const user = await createTestUser();
    await createTestOrder(user.id, "cancelled");
    expect(await deleteAccount(user.id, TEST_PASSWORD)).toBe("ok");
  });

  it("só apaga a conta de quem tem sessão, nunca a de outro cliente", async () => {
    const me = await createTestUser();
    const other = await createTestUser();
    await createTestTicket(other.id);
    await loginAsCustomer(me.id);

    expect(await deleteAccountAction({ password: TEST_PASSWORD })).toMatchObject({ ok: true });

    const remaining = await getDb().select().from(users);
    expect(remaining.map((u) => u.id)).toEqual([other.id]);
    expect(await getDb().select().from(supportTickets)).toHaveLength(1);
  });

  it("sem sessão vai para o login e não apaga nada", async () => {
    await createTestUser();
    cookieJar.clear();
    await expect(deleteAccountAction({ password: TEST_PASSWORD })).rejects.toThrow("REDIRECT:/entrar");
    expect(await getDb().select().from(users)).toHaveLength(1);
  });

  it("à 5.ª palavra-passe errada fica bloqueado, mesmo com a certa", async () => {
    const user = await createTestUser();
    await loginAsCustomer(user.id);
    for (let i = 0; i < 5; i++) await deleteAccountAction({ password: "Errada-Errada-1!" });

    expect(await deleteAccountAction({ password: TEST_PASSWORD })).toMatchObject({
      ok: false,
      error: expect.stringContaining("Demasiadas tentativas"),
    });
    expect(await getDb().select().from(users)).toHaveLength(1);
  });
});
