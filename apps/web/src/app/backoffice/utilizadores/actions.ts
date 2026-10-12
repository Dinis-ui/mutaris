"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { updateUserStatus } from "@/lib/backoffice-users";

export type UserStatusResult = { ok: true } | { ok: false; error: string };

/**
 * Suspende ou reativa um utilizador. As Server Actions são endpoints
 * públicos, por isso confirmamos aqui a sessão de administrador e
 * validamos os argumentos (vêm do cliente).
 */
export async function setUserStatusAction(
  userId: string,
  status: "active" | "suspended",
): Promise<UserStatusResult> {
  await requireAdmin();

  if (typeof userId !== "string" || (status !== "active" && status !== "suspended")) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const found = await updateUserStatus(userId, status);
    if (!found) return { ok: false, error: "Utilizador não encontrado." };
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/utilizadores");
  revalidatePath(`/backoffice/utilizadores/${userId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
