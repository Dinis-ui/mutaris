import { describe, expect, it } from "vitest";
import { validateProductForm } from "@/lib/backoffice-product-form";
import { MAX_PRODUCT_IMAGES, normalizeImageList } from "@/lib/product-image";

const url = (name: string) => `https://abc.public.blob.vercel-storage.com/produtos/${name}.jpg`;

describe("normalizeImageList", () => {
  it("aceita endereços do nosso armazenamento e mantém a ordem", () => {
    expect(normalizeImageList([url("a"), url("b"), url("c")])).toEqual({
      ok: true,
      urls: [url("a"), url("b"), url("c")],
    });
  });

  it("tira repetidos (fica a primeira) e ignora vazios", () => {
    expect(normalizeImageList([url("a"), "", "  ", url("b"), url("a")])).toEqual({
      ok: true,
      urls: [url("a"), url("b")],
    });
  });

  it("lista vazia é válida (produto sem imagens)", () => {
    expect(normalizeImageList([])).toEqual({ ok: true, urls: [] });
  });

  it.each([
    ["endereço de outro site", ["https://evil.example.com/x.jpg"]],
    ["http em vez de https", ["http://abc.public.blob.vercel-storage.com/x.jpg"]],
    ["não é texto", [42]],
    ["mistura boa com má", [url("a"), "https://evil.example.com/x.jpg"]],
  ])("recusa a lista toda se tiver %s", (_label, values) => {
    expect(normalizeImageList(values)).toEqual({ ok: false });
  });

  it("recusa mais imagens do que o máximo", () => {
    const many = Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => url(String(i)));
    expect(normalizeImageList(many)).toEqual({ ok: false });
    expect(normalizeImageList(many.slice(0, MAX_PRODUCT_IMAGES)).ok).toBe(true);
  });
});

function productForm(images: string[]): FormData {
  const form = new FormData();
  form.set("name", "Câmara exterior");
  form.set("slug", "camara-exterior");
  form.set("category", "videovigilancia");
  form.set("description", "Descrição");
  form.set("price", "89,50");
  form.set("availability", "disponivel");
  form.set("features", "");
  for (const image of images) form.append("images", image);
  return form;
}

describe("validateProductForm — imagens", () => {
  it("lê várias imagens pela ordem do formulário (a primeira é a capa)", () => {
    const result = validateProductForm(productForm([url("b"), url("a")]));
    expect(result).toMatchObject({ ok: true, value: { images: [url("b"), url("a")] } });
  });

  it("sem imagens é válido", () => {
    expect(validateProductForm(productForm([]))).toMatchObject({ ok: true, value: { images: [] } });
  });

  it("recusa endereços que não são do nosso armazenamento", () => {
    const result = validateProductForm(productForm([url("a"), "https://evil.example.com/x.jpg"]));
    expect(result).toMatchObject({ ok: false, fieldErrors: { images: expect.any(String) } });
  });

  it("recusa mais do que o máximo de imagens", () => {
    const many = Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => url(String(i)));
    expect(validateProductForm(productForm(many))).toMatchObject({
      ok: false,
      fieldErrors: { images: expect.any(String) },
    });
  });
});
