/**
 * Armazenamento Blob simulado em memória (para testes). Usado com
 * `vi.mock("@vercel/blob", async () => (await import("@/test/blob-mock")).blobMock)`.
 */
export interface FakeBlob {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export const blobStore = new Map<string, FakeBlob>();
/** Endereços cujo `del` falha (para testar falhas parciais). */
export const blobDeleteFailures = new Set<string>();
export const blobSettings = { pageSize: 1000 };
export const deletedUrls: string[] = [];

export function blobUrl(pathname: string): string {
  return `https://teste.public.blob.vercel-storage.com/${pathname}`;
}

/** Acrescenta um ficheiro ao armazenamento simulado, "carregado há `ageHours` horas". */
export function addBlob(pathname: string, ageHours = 48, size = 1000): string {
  const url = blobUrl(pathname);
  blobStore.set(url, {
    url,
    pathname,
    size,
    uploadedAt: new Date(Date.now() - ageHours * 60 * 60 * 1000),
  });
  return url;
}

export function resetBlobMock() {
  blobStore.clear();
  blobDeleteFailures.clear();
  deletedUrls.length = 0;
  blobSettings.pageSize = 1000;
}

export const blobMock = {
  list: async ({ prefix = "", limit = 1000, cursor }: { prefix?: string; limit?: number; cursor?: string }) => {
    const all = [...blobStore.values()]
      .filter((blob) => blob.pathname.startsWith(prefix))
      .sort((a, b) => a.pathname.localeCompare(b.pathname));
    const start = cursor ? Number(cursor) : 0;
    const size = Math.min(limit, blobSettings.pageSize);
    const blobs = all.slice(start, start + size).map((blob) => ({ ...blob, downloadUrl: blob.url, etag: "x" }));
    const hasMore = start + size < all.length;
    return { blobs, hasMore, cursor: hasMore ? String(start + size) : undefined };
  },
  del: async (urls: string | string[]) => {
    const list = Array.isArray(urls) ? urls : [urls];
    if (list.some((url) => blobDeleteFailures.has(url))) throw new Error("falha simulada");
    for (const url of list) {
      blobStore.delete(url);
      deletedUrls.push(url);
    }
  },
  put: async () => {
    throw new Error("put não é usado nestes testes");
  },
};
