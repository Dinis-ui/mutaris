import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminSessions, admins, auditLog, orders, products, supportTickets, users } from "@/db/schema";
import { FORBIDDEN_MESSAGE } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { setAdminDisabled, setAdminRole } from "@/lib/backoffice-admin-accounts";
import { cookieJar } from "@/test/next-mocks";
import {
  TEST_DATABASE_URL,
  createTestAdmin,
  createTestOrder,
  createTestProduct,
  createTestTicket,
  createTestUser,
  loginAs,
  resetData,
  setupTestDb,
} from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { setUserStatusAction } from "@/app/backoffice/utilizadores/actions";
import { setTicketStatusAction } from "@/app/backoffice/suporte/actions";
import { setOrderStatusAction } from "@/app/backoffice/encomendas/actions";
import { deleteProductAction } from "@/app/backoffice/loja/actions";
import { createAdminAction, setAdminRoleAction } from "@/app/backoffice/administradores/actions";

/** Chama `fn` e devolve o destino do redirect (ou null se não houve redirect). */
async function redirectOf(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("REDIRECT:")) {
      return error.message.slice("REDIRECT:".length);
    }
    throw error;
  }
}

// Sem TEST_DATABASE_URL estes testes são saltados (ver src/test/db.ts).
describe.skipIf(!TEST_DATABASE_URL)("perfis de permissões (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  describe("sessão e requireAdmin", () => {
    it("sem cookie vai para o login", async () => {
      expect(await redirectOf(() => requireAdmin())).toBe("/backoffice/login");
    });

    it("cookie inventado vai para o login", async () => {
      cookieJar.set("mutaris_backoffice_session", "token-falso");
      expect(await redirectOf(() => requireAdmin())).toBe("/backoffice/login");
    });

    it("na base de dados fica só o hash do token", async () => {
      const admin = await createTestAdmin("full");
      const token = await loginAs(admin.id);
      const [session] = await getDb().select().from(adminSessions);
      expect(session?.tokenHash).toBeDefined();
      expect(session?.tokenHash).not.toBe(token);
    });

    it("sessão expirada vai para o login", async () => {
      const admin = await createTestAdmin("full");
      await loginAs(admin.id);
      await getDb().update(adminSessions).set({ expiresAt: new Date(Date.now() - 1000) });
      expect(await redirectOf(() => requireAdmin())).toBe("/backoffice/login");
    });

    it("administrador desativado perde o acesso de imediato", async () => {
      const admin = await createTestAdmin("full");
      await loginAs(admin.id);
      await getDb().update(admins).set({ disabledAt: new Date() }).where(eq(admins.id, admin.id));
      expect(await redirectOf(() => requireAdmin())).toBe("/backoffice/login");
    });

    it("Leitura só passa em 'view'", async () => {
      await loginAs((await createTestAdmin("read")).id);
      expect(await redirectOf(() => requireAdmin())).toBeNull();
      for (const permission of ["support", "manage", "admins"] as const) {
        expect(await redirectOf(() => requireAdmin(permission))).toBe("/backoffice/sem-permissao");
      }
    });

    it("Suporte passa em 'support' mas não em 'manage' nem 'admins'", async () => {
      await loginAs((await createTestAdmin("support")).id);
      expect(await redirectOf(() => requireAdmin("support"))).toBeNull();
      expect(await redirectOf(() => requireAdmin("manage"))).toBe("/backoffice/sem-permissao");
      expect(await redirectOf(() => requireAdmin("admins"))).toBe("/backoffice/sem-permissao");
    });

    it("Total passa em tudo", async () => {
      await loginAs((await createTestAdmin("full")).id);
      for (const permission of ["view", "support", "manage", "admins"] as const) {
        expect(await redirectOf(() => requireAdmin(permission))).toBeNull();
      }
    });

    it("mudar o perfil vale no pedido seguinte, sem novo login", async () => {
      const admin = await createTestAdmin("full");
      await loginAs(admin.id);
      expect(await redirectOf(() => requireAdmin("manage"))).toBeNull();
      await getDb().update(admins).set({ role: "read" }).where(eq(admins.id, admin.id));
      expect(await redirectOf(() => requireAdmin("manage"))).toBe("/backoffice/sem-permissao");
    });
  });

  describe("Server Actions respeitam o perfil", () => {
    it("Leitura não suspende clientes", async () => {
      const user = await createTestUser("active");
      await loginAs((await createTestAdmin("read")).id);

      expect(await setUserStatusAction(user.id, "suspended")).toEqual({
        ok: false,
        error: FORBIDDEN_MESSAGE,
      });
      const [after] = await getDb().select().from(users).where(eq(users.id, user.id));
      expect(after?.status).toBe("active");
    });

    it("Total suspende clientes e fica registado na atividade", async () => {
      const user = await createTestUser("active");
      await loginAs((await createTestAdmin("full")).id);

      expect(await setUserStatusAction(user.id, "suspended")).toEqual({ ok: true });
      const [after] = await getDb().select().from(users).where(eq(users.id, user.id));
      expect(after?.status).toBe("suspended");
      const log = await getDb().select().from(auditLog);
      expect(log.map((row) => row.action)).toEqual(["user.suspended"]);
    });

    it("Suporte não suspende clientes", async () => {
      const user = await createTestUser("active");
      await loginAs((await createTestAdmin("support")).id);
      expect(await setUserStatusAction(user.id, "suspended")).toMatchObject({ ok: false });
    });

    it("pedidos de suporte: Leitura não, Suporte sim", async () => {
      const ticket = await createTestTicket();
      const reader = await createTestAdmin("read");
      await loginAs(reader.id);
      expect(await setTicketStatusAction(ticket.id, "resolved")).toEqual({
        ok: false,
        error: FORBIDDEN_MESSAGE,
      });
      const [unchanged] = await getDb().select().from(supportTickets);
      expect(unchanged?.status).toBe("open");

      await loginAs((await createTestAdmin("support")).id);
      expect(await setTicketStatusAction(ticket.id, "resolved")).toEqual({ ok: true });
      const [changed] = await getDb().select().from(supportTickets);
      expect(changed?.status).toBe("resolved");
    });

    it("encomendas: Suporte não altera o estado", async () => {
      const order = await createTestOrder();
      await loginAs((await createTestAdmin("support")).id);
      expect(await setOrderStatusAction(order.id, "shipped")).toMatchObject({ ok: false });
      const [after] = await getDb().select().from(orders);
      expect(after?.status).toBe("awaiting-payment");
    });

    it("loja: Leitura não apaga produtos, Total apaga", async () => {
      const product = await createTestProduct();
      await loginAs((await createTestAdmin("read")).id);
      expect(await deleteProductAction(product.id)).toEqual({ ok: false, error: FORBIDDEN_MESSAGE });
      expect(await getDb().select().from(products)).toHaveLength(1);

      await loginAs((await createTestAdmin("full")).id);
      expect(await deleteProductAction(product.id)).toEqual({ ok: true });
      expect(await getDb().select().from(products)).toHaveLength(0);
    });

    it("só o perfil Total gere administradores", async () => {
      const target = await createTestAdmin("read");
      await loginAs((await createTestAdmin("support")).id);

      expect(
        await redirectOf(() =>
          createAdminAction({
            name: "Novo Admin",
            email: "novo@teste.local",
            password: "Teste-Teste-123!",
            role: "full",
          }),
        ),
      ).toBe("/backoffice/sem-permissao");
      expect(await redirectOf(() => setAdminRoleAction(target.id, "full"))).toBe(
        "/backoffice/sem-permissao",
      );
      const [after] = await getDb().select().from(admins).where(eq(admins.id, target.id));
      expect(after?.role).toBe("read");
    });

    it("Total cria administradores com o perfil escolhido e rejeita perfis inventados", async () => {
      await loginAs((await createTestAdmin("full")).id);
      const input = { name: "Novo Admin", email: "novo@teste.local", password: "Teste-Teste-123!" };

      expect(await createAdminAction({ ...input, role: "superuser" })).toMatchObject({ ok: false });
      expect(await createAdminAction({ ...input, role: "read" })).toMatchObject({ ok: true });
      const [created] = await getDb().select().from(admins).where(eq(admins.email, input.email));
      expect(created?.role).toBe("read");
    });
  });

  describe("regras de segurança dos perfis", () => {
    it("não podes mudar o teu próprio perfil", async () => {
      const me = await createTestAdmin("full");
      await createTestAdmin("full");
      await loginAs(me.id);
      expect(await setAdminRole(me.id, "read")).toMatchObject({ ok: false });
    });

    it("um Total pode baixar o perfil de outro administrador", async () => {
      const me = await createTestAdmin("full");
      const other = await createTestAdmin("full");
      await loginAs(me.id);
      expect(await setAdminRole(other.id, "support")).toMatchObject({ ok: true, role: "support" });
      const [after] = await getDb().select().from(admins).where(eq(admins.id, other.id));
      expect(after?.role).toBe("support");
    });

    it("perfil inválido é recusado", async () => {
      const me = await createTestAdmin("full");
      const other = await createTestAdmin("read");
      await loginAs(me.id);
      expect(await setAdminRole(other.id, "root")).toMatchObject({ ok: false });
    });

    it("desativar um administrador termina-lhe as sessões", async () => {
      const me = await createTestAdmin("full");
      const other = await createTestAdmin("read");
      await loginAs(other.id);
      await loginAs(me.id);
      expect(await setAdminDisabled(other.id, true)).toMatchObject({ ok: true });
      const sessions = await getDb().select().from(adminSessions);
      expect(sessions.map((s) => s.adminId)).toEqual([me.id]);
    });

    it("não podes desativar a tua própria conta", async () => {
      const me = await createTestAdmin("full");
      await loginAs(me.id);
      expect(await setAdminDisabled(me.id, true)).toMatchObject({ ok: false });
    });
  });
});
