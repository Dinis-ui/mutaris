"use server";

import { revalidatePath } from "next/cache";
import { FORBIDDEN_MESSAGE, roleHasPermission } from "@/lib/admin-permissions";
import { recordActivity } from "@/lib/audit";
import { requireAdmin } from "@/lib/backoffice-session-server";
import {
  deleteUnusedImages,
  previewUnusedImages,
  type DeleteUnusedResult,
  type UnusedImagesPreview,
} from "@/lib/unused-images";

export type PreviewActionResult =
  | { ok: true; preview: UnusedImagesPreview }
  | { ok: false; error: string };

export type CleanActionResult =
  | { ok: true; result: DeleteUnusedResult }
  | { ok: false; error: string };

const GENERIC_ERROR = "Não foi possível concluir o pedido. Tenta novamente.";

/** Mostra o que seria apagado (não apaga nada). */
export async function previewUnusedImagesAction(): Promise<PreviewActionResult> {
  const admin = await requireAdmin();
  if (!roleHasPermission(admin.role, "manage")) return { ok: false, error: FORBIDDEN_MESSAGE };

  try {
    return { ok: true, preview: await previewUnusedImages() };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}

/** Apaga as imagens não usadas, se a lista continuar igual à que o administrador viu. */
export async function deleteUnusedImagesAction(expectedCount: number): Promise<CleanActionResult> {
  const admin = await requireAdmin();
  if (!roleHasPermission(admin.role, "manage")) return { ok: false, error: FORBIDDEN_MESSAGE };
  if (!Number.isInteger(expectedCount) || expectedCount < 1) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const result = await deleteUnusedImages(expectedCount);
    if (result.status === "ok" && result.deleted > 0) {
      await recordActivity({
        action: "product.images_cleaned",
        target: `${result.deleted} ${result.deleted === 1 ? "imagem" : "imagens"}`,
      });
    }
    revalidatePath("/backoffice/loja/imagens");
    return { ok: true, result };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
