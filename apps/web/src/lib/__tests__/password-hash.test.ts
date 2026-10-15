import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password-hash";

describe("password-hash", () => {
  it("verifica a palavra-passe correta", async () => {
    const hash = await hashPassword("Abcdefghij1!");
    expect(await verifyPassword("Abcdefghij1!", hash)).toBe(true);
  });

  it("recusa uma palavra-passe errada", async () => {
    const hash = await hashPassword("Abcdefghij1!");
    expect(await verifyPassword("Abcdefghij1?", hash)).toBe(false);
  });

  it("usa um sal diferente de cada vez e o formato scrypt:<sal>:<hash>", async () => {
    const [a, b] = await Promise.all([hashPassword("igual"), hashPassword("igual")]);
    expect(a).not.toBe(b);
    expect(a.split(":")).toHaveLength(3);
    expect(a.startsWith("scrypt:")).toBe(true);
  });

  it("recusa hashes mal formados sem rebentar", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt:aa:bb")).toBe(false);
    expect(await verifyPassword("x", "scrypt:aa")).toBe(false);
  });
});
