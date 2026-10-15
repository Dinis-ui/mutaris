import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail, validateRegistration } from "@/lib/customer-auth";

const valid = {
  name: "Ana Silva",
  email: "ana@example.com",
  password: "Abcdefghij1!",
  acceptTerms: true,
};

describe("normalizeEmail / isValidEmail", () => {
  it("normaliza espaços e maiúsculas", () => {
    expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
  });

  it("valida o formato do email", () => {
    expect(isValidEmail("ana@example.com")).toBe(true);
    expect(isValidEmail("ana@example")).toBe(false);
    expect(isValidEmail("ana example@x.com")).toBe(false);
    expect(isValidEmail(`${"a".repeat(250)}@x.pt`)).toBe(false);
  });
});

describe("validateRegistration", () => {
  it("aceita dados válidos", () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it("recusa nome curto, email inválido e termos por aceitar", () => {
    const errors = validateRegistration({
      ...valid,
      name: "A",
      email: "nope",
      acceptTerms: false,
    });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.acceptTerms).toBeDefined();
  });

  it("recusa palavras-passe fracas ou demasiado longas", () => {
    expect(validateRegistration({ ...valid, password: "fraca" }).password).toBeDefined();
    expect(
      validateRegistration({ ...valid, password: `Aa1!${"x".repeat(250)}` }).password,
    ).toBeDefined();
  });
});
