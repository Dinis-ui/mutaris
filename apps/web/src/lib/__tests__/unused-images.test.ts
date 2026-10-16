import { describe, expect, it } from "vitest";
import { UNUSED_MIN_AGE_MS, findUnusedBlobs, type StoredBlob } from "@/lib/unused-images";

const now = new Date("2026-10-16T12:00:00Z");
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

function blob(pathname: string, ageHours: number): StoredBlob {
  return { url: `https://x.public.blob.vercel-storage.com/${pathname}`, pathname, size: 100, uploadedAt: hoursAgo(ageHours) };
}

describe("findUnusedBlobs", () => {
  it("devolve o que não está em uso e já tem idade suficiente", () => {
    const used = blob("produtos/usada.jpg", 100);
    const unused = blob("produtos/orfa.jpg", 100);
    expect(findUnusedBlobs([used, unused], [used.url], now)).toEqual([unused]);
  });

  it("nunca devolve ficheiros recentes (podem estar num formulário aberto)", () => {
    const fresh = blob("produtos/nova.jpg", 1);
    expect(findUnusedBlobs([fresh], [], now)).toEqual([]);
  });

  it("o limite é exatamente 24 horas", () => {
    expect(UNUSED_MIN_AGE_MS).toBe(24 * 60 * 60 * 1000);
    expect(findUnusedBlobs([blob("produtos/a.jpg", 24)], [], now)).toHaveLength(1);
    expect(findUnusedBlobs([blob("produtos/b.jpg", 23.9)], [], now)).toHaveLength(0);
  });

  it("só olha para a pasta produtos/ (nunca toca noutros ficheiros)", () => {
    const other = blob("outra-pasta/x.jpg", 1000);
    const lookalike = blob("produtos-antigos/x.jpg", 1000);
    const root = blob("logo.png", 1000);
    expect(findUnusedBlobs([other, lookalike, root], [], now)).toEqual([]);
  });

  it("sem nenhum ficheiro, não há nada", () => {
    expect(findUnusedBlobs([], [], now)).toEqual([]);
  });
});
