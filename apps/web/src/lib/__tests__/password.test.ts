import { describe, expect, it } from "vitest";
import {
  getPasswordStrength,
  meetsAllPasswordRules,
  validatePasswordChange,
} from "@/lib/password";

describe("meetsAllPasswordRules", () => {
  it("aceita uma palavra-passe que cumpre todas as regras", () => {
    expect(meetsAllPasswordRules("Abcdefghij1!")).toBe(true);
  });

  it.each([
    ["curta demais", "Abc1!"],
    ["sem maiúscula", "abcdefghij1!"],
    ["sem minúscula", "ABCDEFGHIJ1!"],
    ["sem número", "Abcdefghijk!"],
    ["sem símbolo", "Abcdefghijk1"],
  ])("recusa %s", (_label, value) => {
    expect(meetsAllPasswordRules(value)).toBe(false);
  });

  it("não conta letras acentuadas como símbolos", () => {
    expect(meetsAllPasswordRules("Abcdefghijé1")).toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it("devolve nível 0 quando vazia", () => {
    expect(getPasswordStrength("").level).toBe(0);
  });

  it("devolve nível 4 para 16+ caracteres que cumprem tudo", () => {
    expect(getPasswordStrength("Abcdefghijklmn1!").level).toBe(4);
  });
});

describe("validatePasswordChange", () => {
  it("não dá erros quando tudo está certo", () => {
    expect(
      validatePasswordChange({ current: "antiga", next: "Abcdefghij1!", confirm: "Abcdefghij1!" }),
    ).toEqual({});
  });

  it("exige a palavra-passe atual e a confirmação", () => {
    const errors = validatePasswordChange({ current: "", next: "Abcdefghij1!", confirm: "" });
    expect(errors.current).toBeDefined();
    expect(errors.confirm).toBeDefined();
  });

  it("recusa uma nova palavra-passe igual à atual", () => {
    const errors = validatePasswordChange({
      current: "Abcdefghij1!",
      next: "Abcdefghij1!",
      confirm: "Abcdefghij1!",
    });
    expect(errors.next).toBeDefined();
  });

  it("recusa confirmação diferente", () => {
    const errors = validatePasswordChange({
      current: "antiga",
      next: "Abcdefghij1!",
      confirm: "Outra-coisa1!",
    });
    expect(errors.confirm).toBeDefined();
  });
});
