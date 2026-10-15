"use server";

import { revalidatePath } from "next/cache";
import { FORBIDDEN_MESSAGE, roleHasPermission } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
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
  const admin = await requireAdmin();
  if (!roleHasPermission(admin.role, "manage")) return { ok: false, error: FORBIDDEN_MESSAGE };

  if (typeof userId !== "string" || (status !== "active" && status !== "suspended")) {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const name = await updateUserStatus(userId, status);
    if (!name) return { ok: false, error: "Utilizador não encontrado." };
    await recordActivity({
      action: status === "suspended" ? "user.suspended" : "user.reactivated",
      target: name,
    });
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/utilizadores");
  revalidatePath(`/backoffice/utilizadores/${userId}`);
  revalidatePath("/backoffice");
  return { ok: true };
}
