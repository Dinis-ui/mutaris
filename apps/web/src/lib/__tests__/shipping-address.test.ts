import { describe, expect, it } from "vitest";
import { formatShippingAddress, validateShippingAddress } from "@/lib/shipping-address";

const valid = {
  name: "  Maria Silva ",
  phone: "+351 912 345 678",
  line1: "Rua das Flores, 12",
  line2: "3.º Esq.",
  postalCode: "1000-001",
  city: "Lisboa",
};

describe("validateShippingAddress", () => {
  it("aceita uma morada válida e limpa os espaços", () => {
    const result = validateShippingAddress(valid);
    expect(result).toMatchObject({ ok: true, address: { name: "Maria Silva", country: "PT" } });
  });

  it("telefone e 2.ª linha são opcionais", () => {
    expect(validateShippingAddress({ ...valid, phone: "", line2: "" }).ok).toBe(true);
  });

  it.each([
    ["código postal sem hífen", { postalCode: "1000001" }, "postalCode"],
    ["código postal com letras", { postalCode: "ABCD-123" }, "postalCode"],
    ["nome vazio", { name: " " }, "name"],
    ["rua vazia", { line1: "" }, "line1"],
    ["localidade vazia", { city: "" }, "city"],
    ["telefone inválido", { phone: "abc" }, "phone"],
  ])("recusa %s", (_label, change, field) => {
    const result = validateShippingAddress({ ...valid, ...change });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toContain(field);
  });

  it("ignora o país enviado: só entregamos em Portugal", () => {
    const result = validateShippingAddress({ ...valid, country: "ES" });
    expect(result).toMatchObject({ ok: true, address: { country: "PT" } });
  });

  it("não rebenta com lixo (null, texto, números, textos enormes)", () => {
    for (const input of [null, undefined, "morada", 42, [], { name: 5, line1: {} }]) {
      expect(validateShippingAddress(input).ok).toBe(false);
    }
    expect(validateShippingAddress({ ...valid, line1: "x".repeat(10_000) }).ok).toBe(false);
  });
});

describe("formatShippingAddress", () => {
  it("uma linha por parte, sem linhas vazias", () => {
    const result = validateShippingAddress({ ...valid, line2: "" });
    if (!result.ok) throw new Error("morada devia ser válida");
    expect(formatShippingAddress(result.address)).toBe(
      "Maria Silva\nRua das Flores, 12\n1000-001 Lisboa\nPortugal",
    );
  });
});
