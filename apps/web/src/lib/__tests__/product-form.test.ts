import { describe, expect, it } from "vitest";
import { centsToPriceInput, parsePriceToCents, slugify } from "@/lib/backoffice-product-form";

describe("slugify", () => {
  it("remove acentos e símbolos", () => {
    expect(slugify("Câmara exterior — 4K")).toBe("camara-exterior-4k");
  });

  it("não deixa hífenes nas pontas", () => {
    expect(slugify("  --Olá!--  ")).toBe("ola");
  });
});

describe("parsePriceToCents", () => {
  it("aceita vírgula e ponto", () => {
    expect(parsePriceToCents("89")).toBe(8900);
    expect(parsePriceToCents("89,5")).toBe(8950);
    expect(parsePriceToCents("89.50")).toBe(8950);
  });

  it("recusa valores inválidos", () => {
    expect(parsePriceToCents("")).toBeNull();
    expect(parsePriceToCents("abc")).toBeNull();
    expect(parsePriceToCents("-5")).toBeNull();
    expect(parsePriceToCents("1,234")).toBeNull();
  });
});

describe("centsToPriceInput", () => {
  it("formata com vírgula", () => {
    expect(centsToPriceInput(89.5)).toBe("89,50");
  });
});
