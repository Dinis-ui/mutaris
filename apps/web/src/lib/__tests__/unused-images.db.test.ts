import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { FORBIDDEN_MESSAGE } from "@/lib/admin-permissions";
import {
  addBlob,
  blobDeleteFailures,
  blobSettings,
  blobStore,
  deletedUrls,
  resetBlobMock,
} from "@/test/blob-mock";
import {
  TEST_DATABASE_URL,
  createTestAdmin,
  createTestProduct,
  loginAs,
  resetData,
  setupTestDb,
} from "@/test/db";

vi.mock("next/headers", async () => (await import("@/test/next-mocks")).headersMock);
vi.mock("next/navigation", async () => (await import("@/test/next-mocks")).navigationMock);
vi.mock("next/cache", async () => (await import("@/test/next-mocks")).cacheMock);
vi.mock("@vercel/blob", async () => (await import("@/test/blob-mock")).blobMock);

import {
  deleteUnusedImagesAction,
  previewUnusedImagesAction,
} from "@/app/backoffice/loja/imagens/actions";

describe.skipIf(!TEST_DATABASE_URL)("limpeza de imagens não usadas (com base de dados)", () => {
  beforeAll(() => {
    process.env.BLOB_READ_WRITE_TOKEN = "token-de-teste";
    return setupTestDb();
  });
  beforeEach(async () => {
    await resetData();
    resetBlobMock();
  });
  afterAll(resetData);

  async function setup() {
    await loginAs((await createTestAdmin("full")).id);
    const usedInList = addBlob("produtos/em-uso-lista.jpg", 100);
    const usedLegacy = addBlob("produtos/em-uso-antiga.jpg", 100);
    await createTestProduct({ images: [usedInList] });
    await createTestProduct({ image: usedLegacy });
    const orphanA = addBlob("produtos/orfa-a.jpg", 100, 2048);
    const orphanB = addBlob("produtos/orfa-b.jpg", 30, 1024);
    const fresh = addBlob("produtos/recente.jpg", 1);
    const elsewhere = addBlob("outra-pasta/x.jpg", 1000);
    return { usedInList, usedLegacy, orphanA, orphanB, fresh, elsewhere };
  }

  it("a pré-visualização conta só as órfãs com idade, e não apaga nada", async () => {
    await setup();
    const response = await previewUnusedImagesAction();
    expect(response).toEqual({
      ok: true,
      preview: {
        status: "ok",
        count: 2,
        totalBytes: 3072,
        sample: ["produtos/orfa-a.jpg", "produtos/orfa-b.jpg"],
      },
    });
    expect(deletedUrls).toEqual([]);
    expect(blobStore.size).toBe(6);
  });

  it("apaga só as órfãs; nunca as em uso, as recentes nem as de fora de produtos/", async () => {
    const s = await setup();
    const response = await deleteUnusedImagesAction(2);

    expect(response).toEqual({ ok: true, result: { status: "ok", deleted: 2, failed: 0, freedBytes: 3072 } });
    expect(deletedUrls.sort()).toEqual([s.orphanA, s.orphanB].sort());
    expect([...blobStore.keys()].sort()).toEqual(
      [s.usedInList, s.usedLegacy, s.fresh, s.elsewhere].sort(),
    );
  });

  it("fica registado na atividade", async () => {
    await setup();
    await deleteUnusedImagesAction(2);
    const log = await getDb().select().from(auditLog);
    expect(log.map((row) => [row.action, row.target])).toEqual([["product.images_cleaned", "2 imagens"]]);
  });

  it("se a lista mudou desde a pré-visualização, não apaga nada", async () => {
    await setup();
    const response = await deleteUnusedImagesAction(5);
    expect(response).toEqual({ ok: true, result: { status: "changed", count: 2 } });
    expect(deletedUrls).toEqual([]);
  });

  it("recusa um número inválido vindo do cliente", async () => {
    await setup();
    for (const bad of [0, -1, 1.5, Number.NaN, "2" as unknown as number]) {
      expect(await deleteUnusedImagesAction(bad)).toEqual({ ok: false, error: "Pedido inválido." });
    }
    expect(deletedUrls).toEqual([]);
  });

  it("se um lote falha, conta as falhas e não regista as que não apagou", async () => {
    const s = await setup();
    blobDeleteFailures.add(s.orphanA);
    const response = await deleteUnusedImagesAction(2);
    // As duas vão no mesmo lote: o lote inteiro falha.
    expect(response).toEqual({ ok: true, result: { status: "ok", deleted: 0, failed: 2, freedBytes: 0 } });
    expect(await getDb().select().from(auditLog)).toHaveLength(0);
  });

  it("lê todas as páginas da lista do armazenamento", async () => {
    await loginAs((await createTestAdmin("full")).id);
    for (let i = 0; i < 7; i++) addBlob(`produtos/orfa-${i}.jpg`, 100);
    blobSettings.pageSize = 3; // 3 páginas
    const response = await previewUnusedImagesAction();
    expect(response).toMatchObject({ ok: true, preview: { status: "ok", count: 7 } });
  });

  it("sem imagens por limpar: contagem zero", async () => {
    await loginAs((await createTestAdmin("full")).id);
    expect(await previewUnusedImagesAction()).toMatchObject({ ok: true, preview: { count: 0 } });
  });

  it("sem armazenamento configurado, diz isso e não faz nada", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    try {
      expect(await previewUnusedImagesAction()).toEqual({ ok: true, preview: { status: "not-configured" } });
      expect(await deleteUnusedImagesAction(1)).toEqual({ ok: true, result: { status: "not-configured" } });
    } finally {
      process.env.BLOB_READ_WRITE_TOKEN = token;
    }
  });

  it.each(["read", "support"] as const)("o perfil %s não pode procurar nem apagar", async (role) => {
    await loginAs((await createTestAdmin(role)).id);
    addBlob("produtos/orfa.jpg", 100);
    expect(await previewUnusedImagesAction()).toEqual({ ok: false, error: FORBIDDEN_MESSAGE });
    expect(await deleteUnusedImagesAction(1)).toEqual({ ok: false, error: FORBIDDEN_MESSAGE });
    expect(deletedUrls).toEqual([]);
  });

  it("sem sessão vai para o login", async () => {
    await expect(previewUnusedImagesAction()).rejects.toThrow("REDIRECT:/backoffice/login");
    await expect(deleteUnusedImagesAction(1)).rejects.toThrow("REDIRECT:/backoffice/login");
  });
});
