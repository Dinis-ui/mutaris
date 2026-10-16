import { del, list } from "@vercel/blob";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";

/**
 * Limpeza de imagens de produto que ficaram no armazenamento Blob sem serem
 * usadas por nenhum produto (por exemplo, carregadas num formulário que foi
 * fechado sem guardar). Só servidor; exige a permissão `manage`.
 *
 * Regras de segurança — apagar ficheiros não tem volta:
 *  - só olha para `produtos/` (nunca toca noutros ficheiros do armazenamento);
 *  - só apaga ficheiros com mais de 24 horas (uma imagem acabada de carregar
 *    num formulário aberto ainda não está guardada em nenhum produto);
 *  - "em uso" = qualquer endereço em `products.images` ou `products.image`;
 *  - a lista a apagar é sempre recalculada no servidor (nunca vem do cliente).
 */

export const PRODUCT_IMAGE_PREFIX = "produtos/";
export const UNUSED_MIN_AGE_MS = 24 * 60 * 60 * 1000;
/** Páginas de 1000 ficheiros; limite de segurança para nunca ficar num ciclo. */
const MAX_LIST_PAGES = 20;
const DELETE_BATCH_SIZE = 100;

export interface StoredBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

/** Ficheiros em `produtos/` que nenhum produto usa e que já têm idade suficiente. */
export function findUnusedBlobs(
  blobs: readonly StoredBlob[],
  usedUrls: Iterable<string>,
  now: Date = new Date(),
  minAgeMs: number = UNUSED_MIN_AGE_MS,
): StoredBlob[] {
  const used = new Set(usedUrls);
  const cutoff = now.getTime() - minAgeMs;
  return blobs.filter(
    (blob) =>
      blob.pathname.startsWith(PRODUCT_IMAGE_PREFIX) &&
      !used.has(blob.url) &&
      blob.uploadedAt.getTime() <= cutoff,
  );
}

export type UnusedImagesPreview =
  | { status: "not-configured" }
  | { status: "ok"; count: number; totalBytes: number; sample: string[] };

export type DeleteUnusedResult =
  | { status: "not-configured" }
  /** A lista mudou desde a pré-visualização: não se apagou nada. */
  | { status: "changed"; count: number }
  | { status: "ok"; deleted: number; failed: number; freedBytes: number };

function storeConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function listProductBlobs(): Promise<StoredBlob[]> {
  const found: StoredBlob[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_LIST_PAGES; page++) {
    const result = await list({ prefix: PRODUCT_IMAGE_PREFIX, limit: 1000, cursor });
    for (const blob of result.blobs) {
      found.push({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt),
      });
    }
    if (!result.hasMore || !result.cursor) break;
    cursor = result.cursor;
  }
  return found;
}

async function usedImageUrls(): Promise<string[]> {
  const rows = await getDb()
    .select({ image: products.image, images: products.images })
    .from(products);
  return rows.flatMap((row) => [...row.images, ...(row.image ? [row.image] : [])]);
}

/** Lista (sem apagar nada) o que seria apagado. */
export async function previewUnusedImages(): Promise<UnusedImagesPreview> {
  await requireAdmin("manage");
  if (!storeConfigured()) return { status: "not-configured" };

  const blobs = await listProductBlobs();
  // Os endereços em uso são lidos DEPOIS de listar, para não apagar o que acabou de ser guardado.
  const unused = findUnusedBlobs(blobs, await usedImageUrls());
  return {
    status: "ok",
    count: unused.length,
    totalBytes: unused.reduce((sum, blob) => sum + blob.size, 0),
    sample: unused.slice(0, 10).map((blob) => blob.pathname),
  };
}

/**
 * Apaga as imagens não usadas. `expectedCount` é o número que o administrador viu
 * na pré-visualização: se for diferente agora, não apaga nada e pede nova pré-visualização.
 */
export async function deleteUnusedImages(expectedCount: number): Promise<DeleteUnusedResult> {
  await requireAdmin("manage");
  if (!storeConfigured()) return { status: "not-configured" };

  const blobs = await listProductBlobs();
  const unused = findUnusedBlobs(blobs, await usedImageUrls());
  if (unused.length !== expectedCount) return { status: "changed", count: unused.length };

  let deleted = 0;
  let failed = 0;
  let freedBytes = 0;
  for (let start = 0; start < unused.length; start += DELETE_BATCH_SIZE) {
    const batch = unused.slice(start, start + DELETE_BATCH_SIZE);
    try {
      await del(batch.map((blob) => blob.url));
      deleted += batch.length;
      freedBytes += batch.reduce((sum, blob) => sum + blob.size, 0);
    } catch {
      failed += batch.length;
    }
  }
  return { status: "ok", deleted, failed, freedBytes };
}
