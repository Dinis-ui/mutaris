import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  clearFailures,
  isRateLimited,
  registerFailure,
  type LoginAttempt,
} from "@/lib/backoffice-rate-limit";
import { TEST_DATABASE_URL, resetData, setupTestDb } from "@/test/db";

const attempt: LoginAttempt = { ip: "1.2.3.4", email: "a@teste.local" };

describe.skipIf(!TEST_DATABASE_URL)("limite de tentativas de login (com base de dados)", () => {
  beforeAll(setupTestDb);
  beforeEach(resetData);
  afterAll(resetData);

  it("bloqueia à 5.ª falha para o mesmo IP + email", async () => {
    for (let i = 0; i < 4; i++) await registerFailure(attempt);
    expect(await isRateLimited(attempt)).toBe(false);
    await registerFailure(attempt);
    expect(await isRateLimited(attempt)).toBe(true);
  });

  it("outro email do mesmo IP não é bloqueado pelas falhas do par", async () => {
    for (let i = 0; i < 5; i++) await registerFailure(attempt);
    expect(await isRateLimited({ ...attempt, email: "b@teste.local" })).toBe(false);
  });

  it("bloqueia o IP todo às 20 falhas, mesmo com emails diferentes", async () => {
    for (let i = 0; i < 20; i++) await registerFailure({ ...attempt, email: `x${i}@teste.local` });
    expect(await isRateLimited({ ...attempt, email: "novo@teste.local" })).toBe(true);
  });

  it("login com sucesso limpa as falhas do par", async () => {
    for (let i = 0; i < 5; i++) await registerFailure(attempt);
    await clearFailures(attempt);
    expect(await isRateLimited(attempt)).toBe(false);
  });

  it("cada âmbito tem contadores próprios (admin vs cliente)", async () => {
    for (let i = 0; i < 5; i++) await registerFailure({ ...attempt, scope: "customer" });
    expect(await isRateLimited({ ...attempt, scope: "customer" })).toBe(true);
    expect(await isRateLimited({ ...attempt, scope: "admin" })).toBe(false);
  });
});
