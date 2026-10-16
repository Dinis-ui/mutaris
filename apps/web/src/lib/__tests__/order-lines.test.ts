import { describe, expect, it } from "vitest";
import { ORDER_LIMITS, parseOrderLines } from "@/lib/orders";

describe("parseOrderLines", () => {
  it("aceita linhas válidas", () => {
    expect(parseOrderLines([{ productId: "a", quantity: 2 }])).toEqual([
      { productId: "a", quantity: 2 },
    ]);
  });

  it("junta produtos repetidos somando as unidades", () => {
    expect(
      parseOrderLines([
        { productId: "a", quantity: 1 },
        { productId: "b", quantity: 1 },
        { productId: "a", quantity: 2 },
      ]),
    ).toEqual([
      { productId: "a", quantity: 3 },
      { productId: "b", quantity: 1 },
    ]);
  });

  it.each([
    ["lista vazia", []],
    ["não é lista", "a"],
    ["null", null],
    ["quantidade 0", [{ productId: "a", quantity: 0 }]],
    ["quantidade negativa", [{ productId: "a", quantity: -1 }]],
    ["quantidade decimal", [{ productId: "a", quantity: 1.5 }]],
    ["quantidade em texto", [{ productId: "a", quantity: "2" }]],
    ["quantidade NaN", [{ productId: "a", quantity: Number.NaN }]],
    ["quantidade Infinity", [{ productId: "a", quantity: Number.POSITIVE_INFINITY }]],
    ["sem produto", [{ quantity: 1 }]],
    ["produto vazio", [{ productId: "", quantity: 1 }]],
    ["linha nula", [null]],
    ["acima do máximo", [{ productId: "a", quantity: ORDER_LIMITS.maxQuantity + 1 }]],
    [
      "repetidos que somados passam o máximo",
      [
        { productId: "a", quantity: ORDER_LIMITS.maxQuantity },
        { productId: "a", quantity: 1 },
      ],
    ],
  ])("recusa %s", (_label, input) => {
    expect(parseOrderLines(input)).toBeNull();
  });

  it("recusa mais linhas do que o máximo", () => {
    const many = Array.from({ length: ORDER_LIMITS.maxLines + 1 }, (_, i) => ({
      productId: `p${i}`,
      quantity: 1,
    }));
    expect(parseOrderLines(many)).toBeNull();
  });
});
