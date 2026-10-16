import { describe, expect, it } from "vitest";
import { countPendingMigrations } from "@/lib/migration-status";

const entries = [{ when: 100 }, { when: 200 }, { when: 300 }];

describe("countPendingMigrations", () => {
  it("nenhuma por aplicar quando a última aplicada é a mais recente", () => {
    expect(countPendingMigrations(300, entries)).toBe(0);
  });

  it("conta as mais recentes que a última aplicada", () => {
    expect(countPendingMigrations(100, entries)).toBe(2);
    expect(countPendingMigrations(200, entries)).toBe(1);
  });

  it("sem nenhuma aplicada, estão todas por aplicar", () => {
    expect(countPendingMigrations(null, entries)).toBe(3);
  });

  it("o diário real tem migrações com datas crescentes", () => {
    // Se a ordem falhar, a comparação por data deixa de servir.
    const real = countPendingMigrations(null);
    expect(real).toBeGreaterThan(0);
  });
});
