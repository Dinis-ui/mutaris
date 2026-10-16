/**
 * Imagens de produto (guardadas no Vercel Blob). Sem dependências de servidor,
 * por isso o formulário, a loja e as rotas de upload usam as mesmas regras.
 */

/** 4 MB: o limite de um pedido numa função da Vercel é 4,5 MB. */
export const PRODUCT_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const PRODUCT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ProductImageType = (typeof PRODUCT_IMAGE_TYPES)[number];

export const PRODUCT_IMAGE_EXTENSION: Record<ProductImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Só aceitamos endereços do nosso armazenamento Blob (nunca URLs arbitrários). */
export function isBlobImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 500) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Confirma o tipo pelo conteúdo do ficheiro (e não só pelo nome ou tipo declarado). */
export function detectImageType(bytes: Uint8Array): ProductImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => bytes[index] === byte)
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

/** Imagens por produto (limite técnico; a loja e o formulário usam o mesmo). */
export const MAX_PRODUCT_IMAGES = 6;

export type ImageListResult = { ok: true; urls: string[] } | { ok: false };

/**
 * Limpa uma lista de imagens vinda do cliente: só endereços do nosso Blob,
 * sem repetidos (mantém a primeira ocorrência), no máximo `MAX_PRODUCT_IMAGES`.
 * Qualquer valor inválido recusa a lista toda.
 */
export function normalizeImageList(values: unknown[]): ImageListResult {
  const urls: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") return { ok: false };
    const url = value.trim();
    if (!url) continue;
    if (!isBlobImageUrl(url)) return { ok: false };
    if (!urls.includes(url)) urls.push(url);
  }
  return urls.length > MAX_PRODUCT_IMAGES ? { ok: false } : { ok: true, urls };
}
