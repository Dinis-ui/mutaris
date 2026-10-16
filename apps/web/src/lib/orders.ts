import { randomBytes } from "node:crypto";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import {
  validateShippingAddress,
  type ShippingAddress,
  type ShippingAddressErrors,
} from "@/lib/shipping-address";

/**
 * Criação de encomendas (só servidor). É a base do futuro checkout: ainda não
 * há pagamento, portes nem IVA, por isso a encomenda nasce "à espera de
 * pagamento" e o total é só a soma dos artigos.
 *
 * Regra de ouro: NUNCA confiar no cliente para preços ou nomes. O cliente só
 * diz que produtos e quantas unidades quer; preço e nome vêm da base de dados.
 */

export const ORDER_LIMITS = {
  /** Linhas (produtos diferentes) por encomenda. */
  maxLines: 50,
  /** Unidades por produto. */
  maxQuantity: 99,
  /** Limite do inteiro da base de dados (cêntimos), com folga. */
  maxTotalCents: 2_000_000_000,
} as const;

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

export type CreateOrderResult =
  | { status: "ok"; orderId: string; number: string; totalCents: number }
  | { status: "invalid"; error: string; fields?: ShippingAddressErrors }
  /** Algum produto já não existe ou não se pode comprar (indisponível, sob consulta, brevemente). */
  | { status: "unavailable"; productIds: string[] };

const NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newOrderNumber(): string {
  let code = "";
  for (const byte of randomBytes(8)) code += NUMBER_ALPHABET[byte % NUMBER_ALPHABET.length];
  return `MUT-${code}`;
}

/** Valida as linhas e junta produtos repetidos (somando as unidades). */
export function parseOrderLines(input: unknown): OrderLineInput[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  if (input.length > ORDER_LIMITS.maxLines) return null;

  const quantities = new Map<string, number>();
  for (const line of input) {
    const productId = (line as { productId?: unknown } | null)?.productId;
    const quantity = (line as { quantity?: unknown } | null)?.quantity;
    if (typeof productId !== "string" || productId.length === 0 || productId.length > 100) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) return null;
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  const lines = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  if (lines.some((line) => line.quantity > ORDER_LIMITS.maxQuantity)) return null;
  return lines;
}

/**
 * Cria a encomenda e os artigos numa transação: ou fica tudo, ou nada.
 * `userId` vem da sessão (nunca do pedido).
 */
export async function createOrder(
  userId: string,
  input: { items: unknown; shipping: unknown },
): Promise<CreateOrderResult> {
  const lines = parseOrderLines(input?.items);
  if (!lines) {
    return {
      status: "invalid",
      error: `Indica entre 1 e ${ORDER_LIMITS.maxLines} artigos, com 1 a ${ORDER_LIMITS.maxQuantity} unidades cada.`,
    };
  }

  const shipping = validateShippingAddress(input?.shipping);
  if (!shipping.ok) {
    return { status: "invalid", error: "Corrige a morada de entrega.", fields: shipping.errors };
  }

  return getDb().transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(products)
      .where(inArray(products.id, lines.map((line) => line.productId)));
    const byId = new Map(rows.map((row) => [row.id, row]));

    const unavailable = lines
      .filter((line) => byId.get(line.productId)?.availability !== "disponivel")
      .map((line) => line.productId);
    if (unavailable.length > 0) return { status: "unavailable" as const, productIds: unavailable };

    const priced = lines.map((line) => {
      const product = byId.get(line.productId)!;
      return { line, product };
    });
    const totalCents = priced.reduce(
      (sum, { line, product }) => sum + product.priceCents * line.quantity,
      0,
    );
    if (totalCents > ORDER_LIMITS.maxTotalCents) {
      return { status: "invalid" as const, error: "O total da encomenda é demasiado elevado." };
    }
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

    const address: ShippingAddress = shipping.address;
    for (let attempt = 0; attempt < 5; attempt++) {
      const number = newOrderNumber();
      const [order] = await tx
        .insert(orders)
        .values({
          number,
          userId,
          status: "awaiting-payment",
          totalCents,
          itemCount,
          shippingName: address.name,
          shippingPhone: address.phone || null,
          shippingLine1: address.line1,
          shippingLine2: address.line2 || null,
          shippingPostalCode: address.postalCode,
          shippingCity: address.city,
          shippingCountry: address.country,
        })
        .onConflictDoNothing({ target: orders.number })
        .returning({ id: orders.id });
      if (!order) continue;

      await tx.insert(orderItems).values(
        priced.map(({ line, product }, position) => ({
          orderId: order.id,
          productId: product.id,
          position,
          name: product.name,
          unitPriceCents: product.priceCents,
          quantity: line.quantity,
        })),
      );
      return { status: "ok" as const, orderId: order.id, number, totalCents };
    }
    throw new Error("Não foi possível gerar um número de encomenda único.");
  });
}
