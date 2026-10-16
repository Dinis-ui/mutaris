import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import {
  TEST_DATABASE_URL,
  TEST_PASSWORD,
  createTestAdmin,
  createTestProduct,
  createTestUser,
  loginAs,
  loginAsCustomer,
  resetData,
  setupTestDb,
} from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);

import { createOrder } from "@/lib/orders";
import { getUserOrder } from "@/lib/customer-account";
import { getOrderDetail } from "@/lib/backoffice-orders";
import { deleteAccount } from "@/lib/customer-account";

const shipping = {
  name: "Maria Silva",
  phone: "912345678",
  line1: "Rua das Flores, 12",
  line2: "3.º Esq.",
  postalCode: "1000-001",
  city: "Lisboa",
};

describe.skipIf(!TEST_DATABASE_URL)("itens e morada das encomendas (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  async function productWithPrice(priceCents: number, availability = "disponivel" as const) {
    const product = await createTestProduct();
    await getDb()
      .update(products)
      .set({ priceCents, availability })
      .where(eq(products.id, product.id));
    return product;
  }

  describe("createOrder", () => {
    it("cria a encomenda com os artigos, o total e a morada", async () => {
      const user = await createTestUser();
      const a = await productWithPrice(2500);
      const b = await productWithPrice(990);

      const result = await createOrder(user.id, {
        items: [
          { productId: a.id, quantity: 2 },
          { productId: b.id, quantity: 1 },
        ],
        shipping,
      });

      expect(result).toMatchObject({ status: "ok", totalCents: 5990 });
      if (result.status !== "ok") return;
      expect(result.number).toMatch(/^MUT-[A-Z2-9]{8}$/);

      const [order] = await getDb().select().from(orders).where(eq(orders.id, result.orderId));
      expect(order).toMatchObject({
        userId: user.id,
        status: "awaiting-payment",
        totalCents: 5990,
        itemCount: 3,
        shippingName: "Maria Silva",
        shippingPostalCode: "1000-001",
        shippingCountry: "PT",
        isDemo: false,
      });
      const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, order!.id));
      expect(items.map((i) => [i.name, i.unitPriceCents, i.quantity]).sort()).toEqual(
        [
          [a.name, 2500, 2],
          [b.name, 990, 1],
        ].sort(),
      );
    });

    it("o preço vem sempre da base de dados, nunca do pedido", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(2500);

      const result = await createOrder(user.id, {
        // Campos extra enviados por um cliente malicioso são ignorados.
        items: [{ productId: product.id, quantity: 1, unitPriceCents: 1, name: "Grátis" }],
        shipping,
      });

      expect(result).toMatchObject({ status: "ok", totalCents: 2500 });
      const [item] = await getDb().select().from(orderItems);
      expect(item).toMatchObject({ unitPriceCents: 2500, name: product.name });
    });

    it("não deixa comprar produtos inexistentes nem indisponíveis, e não cria nada", async () => {
      const user = await createTestUser();
      const ok = await productWithPrice(1000);
      const soon = await productWithPrice(1000, "brevemente" as "disponivel");
      const onRequest = await productWithPrice(1000, "sob-consulta" as "disponivel");

      const result = await createOrder(user.id, {
        items: [
          { productId: ok.id, quantity: 1 },
          { productId: soon.id, quantity: 1 },
          { productId: onRequest.id, quantity: 1 },
          { productId: "nao-existe", quantity: 1 },
        ],
        shipping,
      });

      expect(result.status).toBe("unavailable");
      if (result.status === "unavailable") {
        expect(result.productIds.sort()).toEqual([soon.id, onRequest.id, "nao-existe"].sort());
      }
      expect(await getDb().select().from(orders)).toHaveLength(0);
      expect(await getDb().select().from(orderItems)).toHaveLength(0);
    });

    it("recusa morada inválida e não cria nada", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(1000);
      const result = await createOrder(user.id, {
        items: [{ productId: product.id, quantity: 1 }],
        shipping: { ...shipping, postalCode: "123" },
      });
      expect(result).toMatchObject({ status: "invalid", fields: { postalCode: expect.any(String) } });
      expect(await getDb().select().from(orders)).toHaveLength(0);
    });

    it("recusa artigos inválidos (vazio, quantidade 0)", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(1000);
      expect((await createOrder(user.id, { items: [], shipping })).status).toBe("invalid");
      expect(
        (await createOrder(user.id, { items: [{ productId: product.id, quantity: 0 }], shipping })).status,
      ).toBe("invalid");
      expect(await getDb().select().from(orders)).toHaveLength(0);
    });

    it("recusa totais que não cabem na base de dados", async () => {
      const user = await createTestUser();
      // 3 produtos de 100 000 € × 99 unidades ≈ 29,7 milhões de euros: passa o limite do inteiro.
      const items = [];
      for (let i = 0; i < 3; i++) {
        items.push({ productId: (await productWithPrice(10_000_000)).id, quantity: 99 });
      }
      const result = await createOrder(user.id, { items, shipping });
      expect(result).toMatchObject({ status: "invalid" });
      expect(await getDb().select().from(orders)).toHaveLength(0);
    });

    it("mudar ou apagar o produto depois não altera a encomenda", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(2500);
      const result = await createOrder(user.id, {
        items: [{ productId: product.id, quantity: 1 }],
        shipping,
      });
      if (result.status !== "ok") throw new Error("devia criar");
      const originalName = product.name;

      await getDb().update(products).set({ priceCents: 9999, name: "Outro nome" }).where(eq(products.id, product.id));
      let [item] = await getDb().select().from(orderItems);
      expect(item).toMatchObject({ unitPriceCents: 2500, name: originalName });

      await getDb().delete(products).where(eq(products.id, product.id));
      [item] = await getDb().select().from(orderItems);
      expect(item).toMatchObject({ productId: null, unitPriceCents: 2500, name: originalName });
    });

    it("apagar a encomenda apaga os artigos", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(1000);
      const result = await createOrder(user.id, { items: [{ productId: product.id, quantity: 1 }], shipping });
      if (result.status !== "ok") throw new Error("devia criar");
      await getDb().delete(orders).where(eq(orders.id, result.orderId));
      expect(await getDb().select().from(orderItems)).toHaveLength(0);
    });

    it("a base de dados recusa quantidades e preços impossíveis", async () => {
      const user = await createTestUser();
      const product = await productWithPrice(1000);
      const result = await createOrder(user.id, { items: [{ productId: product.id, quantity: 1 }], shipping });
      if (result.status !== "ok") throw new Error("devia criar");
      await expect(
        getDb().insert(orderItems).values({ orderId: result.orderId, name: "x", unitPriceCents: 100, quantity: 0 }),
      ).rejects.toThrow();
      await expect(
        getDb().insert(orderItems).values({ orderId: result.orderId, name: "x", unitPriceCents: -1, quantity: 1 }),
      ).rejects.toThrow();
    });
  });

  describe("o cliente vê os artigos e a morada", () => {
    it("só da sua encomenda (nunca de outro cliente)", async () => {
      const me = await createTestUser();
      const other = await createTestUser();
      const product = await productWithPrice(2500);
      const mine = await createOrder(me.id, { items: [{ productId: product.id, quantity: 2 }], shipping });
      if (mine.status !== "ok") throw new Error("devia criar");

      const order = await getUserOrder(me.id, mine.orderId);
      expect(order).toMatchObject({
        number: mine.number,
        total: 50,
        items: [{ name: product.name, quantity: 2, unitPrice: 25 }],
      });
      expect(order?.shippingAddress).toBe(
        "Maria Silva\nRua das Flores, 12\n3.º Esq.\n1000-001 Lisboa\nPortugal",
      );

      expect(await getUserOrder(other.id, mine.orderId)).toBeNull();
    });

    it("encomenda antiga (sem artigos nem morada) continua a abrir, sem inventar dados", async () => {
      const user = await createTestUser();
      await getDb().insert(orders).values({ number: "ANTIGA-1", userId: user.id, totalCents: 1000, itemCount: 2 });
      const [old] = await getDb().select().from(orders);
      const order = await getUserOrder(user.id, old!.id);
      expect(order?.items).toEqual([]);
      expect(order?.shippingAddress).toBeUndefined();
    });
  });

  describe("o backoffice vê os artigos; a morada só com permissão", () => {
    async function makeOrder() {
      const user = await createTestUser();
      const product = await productWithPrice(2500);
      const result = await createOrder(user.id, { items: [{ productId: product.id, quantity: 1 }], shipping });
      if (result.status !== "ok") throw new Error("devia criar");
      return { user, product, orderId: result.orderId };
    }

    it("perfil Total vê artigos e morada", async () => {
      const { product, orderId } = await makeOrder();
      await loginAs((await createTestAdmin("full")).id);
      const detail = await getOrderDetail(orderId);
      expect(detail?.items).toEqual([expect.objectContaining({ name: product.name, quantity: 1, unitPrice: 25 })]);
      expect(detail?.shipping).toMatchObject({ name: "Maria Silva", postalCode: "1000-001", phone: "912345678" });
      expect(detail?.shippingHidden).toBe(false);
    });

    it.each(["read", "support"] as const)("perfil %s vê os artigos mas NÃO a morada", async (role) => {
      const { orderId } = await makeOrder();
      await loginAs((await createTestAdmin(role)).id);
      const detail = await getOrderDetail(orderId);
      expect(detail?.items).toHaveLength(1);
      expect(detail?.shipping).toBeNull();
      expect(detail?.shippingHidden).toBe(true);
      expect(JSON.stringify(detail)).not.toContain("Rua das Flores");
      expect(JSON.stringify(detail)).not.toContain("912345678");
    });

    it("encomenda sem morada: não há nada escondido", async () => {
      const user = await createTestUser();
      await getDb().insert(orders).values({ number: "ANTIGA-2", userId: user.id, totalCents: 1, itemCount: 1 });
      const [old] = await getDb().select().from(orders);
      await loginAs((await createTestAdmin("read")).id);
      const detail = await getOrderDetail(old!.id);
      expect(detail).toMatchObject({ items: [], shipping: null, shippingHidden: false });
    });
  });

  it("eliminar a conta mantém artigos e morada da encomenda, sem ligação à conta", async () => {
    const user = await createTestUser();
    const product = await productWithPrice(2500);
    const result = await createOrder(user.id, { items: [{ productId: product.id, quantity: 1 }], shipping });
    if (result.status !== "ok") throw new Error("devia criar");
    // Entregue: já não impede a eliminação.
    await getDb().update(orders).set({ status: "delivered" }).where(eq(orders.id, result.orderId));
    await loginAsCustomer(user.id);

    expect(await deleteAccount(user.id, TEST_PASSWORD)).toBe("ok");

    const [kept] = await getDb().select().from(orders).where(eq(orders.id, result.orderId));
    expect(kept).toMatchObject({ userId: null, shippingLine1: "Rua das Flores, 12" });
    expect(await getDb().select().from(orderItems)).toHaveLength(1);
  });
});
