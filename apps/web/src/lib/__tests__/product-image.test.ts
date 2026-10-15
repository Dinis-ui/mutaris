import { describe, expect, it } from "vitest";
import { detectImageType, isBlobImageUrl } from "@/lib/product-image";

describe("detectImageType", () => {
  it("reconhece JPEG, PNG e WebP pelo conteúdo", () => {
    expect(detectImageType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(
      detectImageType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])),
    ).toBe("image/png");
    const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBP");
    expect(detectImageType(webp)).toBe("image/webp");
  });

  it("recusa outros ficheiros e ficheiros vazios", () => {
    expect(detectImageType(new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});

describe("isBlobImageUrl", () => {
  it("aceita só https do armazenamento Blob", () => {
    expect(isBlobImageUrl("https://abc.public.blob.vercel-storage.com/x.png")).toBe(true);
    expect(isBlobImageUrl("http://abc.public.blob.vercel-storage.com/x.png")).toBe(false);
    expect(isBlobImageUrl("https://evil.example.com/x.png")).toBe(false);
    expect(isBlobImageUrl("https://public.blob.vercel-storage.com.evil.com/x.png")).toBe(false);
    expect(isBlobImageUrl("não é um url")).toBe(false);
    expect(isBlobImageUrl(null)).toBe(false);
  });
});
