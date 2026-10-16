import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { FORBIDDEN_MESSAGE } from "@/lib/admin-permissions";
import { addBlob, blobStore, deletedUrls, resetBlobMock } from "@/test/blob-mock";
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

import { saveProductAction } from "@/app/backoffice/loja/actions";
import { DELETE as deleteUploadedImage } from "@/app/api/backoffice-upload/route";
import { getProductBySlug } from "@/lib/products-server";
import { jsonRequest } from "@/test/next-mocks";

function form(fields: Record<string, string>, images: string[], id?: string): FormData {
  const data = new FormData();
  const base = {
    name: "Câmara exterior",
    slug: "camara-exterior",
    category: "videovigilancia",
    description: "Descrição",
    price: "89,50",
    availability: "disponivel",
    features: "",
    ...fields,
  };
  for (const [key, value] of Object.entries(base)) data.set(key, value);
  if (id) data.set("id", id);
  for (const image of images) data.append("images", image);
  return data;
}

describe.skipIf(!TEST_DATABASE_URL)("várias imagens por produto (com base de dados)", () => {
  beforeAll(() => {
    process.env.BLOB_READ_WRITE_TOKEN = "token-de-teste";
    return setupTestDb();
  });
  beforeEach(async () => {
    await resetData();
    resetBlobMock();
  });
  afterAll(resetData);

  it("criar: guarda a lista pela ordem; a capa é a primeira e a coluna antiga espelha-a", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const [a, b, c] = [addBlob("produtos/a.jpg"), addBlob("produtos/b.jpg"), addBlob("produtos/c.jpg")];

    // Criar um produto novo redireciona para a lista da loja.
    await expect(saveProductAction(form({}, [b, a, c]))).rejects.toThrow("REDIRECT:/backoffice/loja");

    const [row] = await getDb().select().from(products);
    expect(row?.images).toEqual([b, a, c]);
    expect(row?.image).toBe(b);
    const product = await getProductBySlug("camara-exterior");
    expect(product).toMatchObject({ image: b, images: [b, a, c] });
  });

  it("criar sem imagens: lista vazia e sem capa", async () => {
    await loginAs((await createTestAdmin("full")).id);
    await expect(saveProductAction(form({}, []))).rejects.toThrow("REDIRECT:/backoffice/loja");
    const product = await getProductBySlug("camara-exterior");
    expect(product?.images).toEqual([]);
    expect(product?.image).toBeUndefined();
  });

  it("editar: mudar a ordem muda a capa e não apaga nada do armazenamento", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const [a, b] = [addBlob("produtos/a.jpg"), addBlob("produtos/b.jpg")];
    const product = await createTestProduct({ slug: "camara-exterior", images: [a, b], image: a });

    expect(await saveProductAction(form({}, [b, a], product.id))).toMatchObject({ status: "saved" });

    const [row] = await getDb().select().from(products).where(eq(products.id, product.id));
    expect(row).toMatchObject({ images: [b, a], image: b });
    expect(deletedUrls).toEqual([]);
  });

  it("editar: as imagens removidas são apagadas do armazenamento; as que ficam não", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const [a, b, c] = [addBlob("produtos/a.jpg"), addBlob("produtos/b.jpg"), addBlob("produtos/c.jpg")];
    const product = await createTestProduct({ slug: "camara-exterior", images: [a, b, c], image: a });

    expect(await saveProductAction(form({}, [a, c], product.id))).toMatchObject({ status: "saved" });

    expect(deletedUrls).toEqual([b]);
    expect([...blobStore.keys()].sort()).toEqual([a, c].sort());
  });

  it("apagar o produto apaga todas as suas imagens do armazenamento", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const [a, b] = [addBlob("produtos/a.jpg"), addBlob("produtos/b.jpg")];
    const product = await createTestProduct({ images: [a, b], image: a });

    const { deleteProductAction } = await import("@/app/backoffice/loja/actions");
    expect(await deleteProductAction(product.id)).toEqual({ ok: true });

    expect(deletedUrls.sort()).toEqual([a, b].sort());
  });

  it("recusa endereços que não são do armazenamento e não guarda nada", async () => {
    await loginAs((await createTestAdmin("full")).id);
    const result = await saveProductAction(form({}, ["https://evil.example.com/x.jpg"]));
    expect(result).toMatchObject({ status: "error", fieldErrors: { images: expect.any(String) } });
    expect(await getDb().select().from(products)).toHaveLength(0);
  });

  it("o perfil Leitura não guarda produtos nem imagens", async () => {
    await loginAs((await createTestAdmin("read")).id);
    const result = await saveProductAction(form({}, [addBlob("produtos/a.jpg")]));
    expect(result).toEqual({ status: "error", message: FORBIDDEN_MESSAGE });
    expect(await getDb().select().from(products)).toHaveLength(0);
  });

  describe("compatibilidade com o código/dados antigos", () => {
    it("produto só com a coluna antiga `image` mostra essa imagem como capa", async () => {
      const old = addBlob("produtos/antiga.jpg");
      await createTestProduct({ slug: "antigo", image: old });
      const product = await getProductBySlug("antigo");
      expect(product).toMatchObject({ image: old, images: [old] });
    });

    it("a migração copia a imagem atual para a lista nova", async () => {
      const old = addBlob("produtos/antiga.jpg");
      const product = await createTestProduct({ image: old, images: [] });
      const semImagem = await createTestProduct({ image: null, images: [] });
      const jaMigrado = await createTestProduct({ image: old, images: [old, addBlob("produtos/extra.jpg")] });

      // Executa o passo de cópia tal como está escrito no ficheiro de migração.
      const file = readFileSync(
        new URL("../../../drizzle/0008_remarkable_zemo.sql", import.meta.url),
        "utf8",
      );
      const update = file.split("--> statement-breakpoint").pop()!.split("\n").filter((l) => !l.startsWith("--")).join("\n");
      await getDb().execute(sql.raw(update));

      const rows = await getDb().select().from(products);
      const byId = new Map(rows.map((row) => [row.id, row]));
      expect(byId.get(product.id)?.images).toEqual([old]);
      expect(byId.get(semImagem.id)?.images).toEqual([]);
      expect(byId.get(jaMigrado.id)?.images).toHaveLength(2); // não mexe no que já tem lista
    });
  });

  describe("apagar imagem enviada e não guardada (rota de upload)", () => {
    it("nunca apaga uma imagem que um produto usa (lista nova ou coluna antiga)", async () => {
      await loginAs((await createTestAdmin("full")).id);
      const inList = addBlob("produtos/lista.jpg");
      const inLegacy = addBlob("produtos/antiga.jpg");
      await createTestProduct({ images: [inList] });
      await createTestProduct({ image: inLegacy });

      await deleteUploadedImage(jsonRequest({ url: inList }));
      await deleteUploadedImage(jsonRequest({ url: inLegacy }));

      expect(deletedUrls).toEqual([]);
    });

    it("apaga uma imagem que nenhum produto usa", async () => {
      await loginAs((await createTestAdmin("full")).id);
      const orphan = addBlob("produtos/solta.jpg");
      await deleteUploadedImage(jsonRequest({ url: orphan }));
      expect(deletedUrls).toEqual([orphan]);
    });

    it("o perfil Leitura não apaga nada", async () => {
      await loginAs((await createTestAdmin("read")).id);
      const orphan = addBlob("produtos/solta.jpg");
      const response = await deleteUploadedImage(jsonRequest({ url: orphan }));
      expect(response.status).toBe(403);
      expect(deletedUrls).toEqual([]);
    });
  });
});
