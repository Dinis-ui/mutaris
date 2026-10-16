"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_TYPES,
  isBlobImageUrl,
} from "@/lib/product-image";

/**
 * Imagens do produto: carregar várias, remover e mudar a ordem (a primeira é a
 * capa, usada na loja). Cada imagem é enviada logo ao escolher; as que forem
 * enviadas mas não guardadas (remover, ou sair da página) podem ficar no
 * armazenamento — a limpeza em "Loja → Imagens não usadas" apaga-as.
 *
 * Os endereços vão no formulário como campos escondidos `images` (um por
 * imagem, pela ordem). A validação a sério é feita na Server Action.
 */
export function ProductImagesField({
  initialImages,
  productName,
  error,
  onBusyChange,
  savedVersion,
}: {
  initialImages: string[];
  productName: string;
  error?: string;
  onBusyChange?: (busy: boolean) => void;
  /** Muda quando o produto é guardado: as imagens atuais passam a ser "guardadas". */
  savedVersion: number;
}) {
  const [images, setImages] = React.useState<string[]>(initialImages);
  // Enviadas nesta sessão e ainda não guardadas no produto (podem ser apagadas já ao remover).
  // Guardadas com a versão a que pertencem: quando o produto é guardado (`savedVersion` sobe),
  // deixam de contar como "não guardadas" sem precisar de efeitos.
  const [unsavedState, setUnsavedState] = React.useState<{ version: number; urls: string[] }>({
    version: savedVersion,
    urls: [],
  });
  const unsaved = new Set(unsavedState.version === savedVersion ? unsavedState.urls : []);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  function setBusy(busy: boolean) {
    setUploading(busy);
    onBusyChange?.(busy);
  }

  function discardFromStorage(url: string) {
    void fetch("/api/backoffice-upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => undefined);
  }

  async function uploadOne(file: File): Promise<string | { error: string }> {
    if (!(PRODUCT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return { error: `${file.name}: usa uma imagem JPG, PNG ou WebP.` };
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      return { error: `${file.name}: demasiado grande (máximo 4 MB).` };
    }
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/backoffice-upload", { method: "POST", body });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        return { error: `${file.name}: ${data?.error ?? "não foi possível carregar."}` };
      }
      return data.url;
    } catch {
      return { error: `${file.name}: não foi possível carregar. Tenta novamente.` };
    }
  }

  async function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    const room = MAX_PRODUCT_IMAGES - images.length;
    const accepted = files.slice(0, Math.max(room, 0));
    const problems: string[] = [];
    if (files.length > accepted.length) {
      problems.push(`Só cabem ${MAX_PRODUCT_IMAGES} imagens por produto.`);
    }

    setMessage(null);
    setBusy(true);
    const added: string[] = [];
    for (const file of accepted) {
      const result = await uploadOne(file);
      if (typeof result === "string") added.push(result);
      else problems.push(result.error);
    }
    setBusy(false);

    if (added.length > 0) {
      setImages((current) => [...current, ...added]);
      setUnsavedState((current) => ({
        version: savedVersion,
        urls: [...(current.version === savedVersion ? current.urls : []), ...added],
      }));
    }
    setMessage(problems.length > 0 ? problems.join(" ") : null);
  }

  function remove(url: string) {
    setMessage(null);
    if (unsaved.has(url)) {
      discardFromStorage(url);
      setUnsavedState((current) => ({
        version: savedVersion,
        urls: (current.version === savedVersion ? current.urls : []).filter((item) => item !== url),
      }));
    }
    setImages((current) => current.filter((item) => item !== url));
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const moved = next[index]!;
      next[index] = next[target]!;
      next[target] = moved;
      return next;
    });
  }

  const shownError = message ?? error;

  return (
    <div className="flex flex-col gap-3">
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, index) => (
            <li key={url} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-ink-3">
                {isBlobImageUrl(url) ? (
                  <Image
                    src={url}
                    alt={`${productName || "Produto"} — imagem ${index + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : null}
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground">
                    Capa
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Mover a imagem ${index + 1} para trás`}
                  disabled={index === 0 || uploading}
                  onClick={() => move(index, -1)}
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Mover a imagem ${index + 1} para a frente`}
                  disabled={index === images.length - 1 || uploading}
                  onClick={() => move(index, 1)}
                >
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => remove(url)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Sem imagens. Sem imagem, a loja mostra o ícone da categoria.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          id="product-images"
          type="file"
          multiple
          accept={PRODUCT_IMAGE_TYPES.join(",")}
          onChange={onFilesSelected}
          disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
        />
        {uploading ? <span className="text-sm text-muted-foreground">A carregar…</span> : null}
        <span className="text-xs text-muted-foreground">
          {images.length} de {MAX_PRODUCT_IMAGES}
        </span>
      </div>
      {shownError ? (
        <p id="product-images-error" role="alert" className="text-xs text-foreground">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
