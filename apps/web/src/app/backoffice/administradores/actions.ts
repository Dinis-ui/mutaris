"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
import { createAdmin, resetAdminPassword, setAdminDisabled } from "@/lib/backoffice-admin-accounts";
import { meetsAllPasswordRules } from "@/lib/password";

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminActionResult> {
  await requireAdmin();

  const name = typeof input?.name === "string" ? input.name.trim() : "";
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";

  if (name.length < 2 || name.length > 80) return { ok: false, error: "Indica um nome válido." };
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Indica um email válido." };
  }
  if (!meetsAllPasswordRules(password)) {
    return { ok: false, error: "A palavra-passe não cumpre todos os requisitos." };
  }

  try {
    const result = await createAdmin({ name, email, password });
    if (!result.ok) return result;
    await recordActivity({ action: "admin.created", target: result.name });
  } catch {
    return { ok: false, error: "Não foi possível criar a conta. Tenta novamente." };
  }

  revalidatePath("/backoffice/administradores");
  return { ok: true, message: "Administrador criado." };
}

export async function setAdminDisabledAction(
  id: string,
  disabled: boolean,
): Promise<AdminActionResult> {
  await requireAdmin();
  if (typeof id !== "string" || typeof disabled !== "boolean") {
    return { ok: false, error: "Pedido inválido." };
  }

  try {
    const result = await setAdminDisabled(id, disabled);
    if (!result.ok) return result;
    await recordActivity({
      action: disabled ? "admin.disabled" : "admin.enabled",
      target: result.name,
    });
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/administradores");
  return { ok: true, message: disabled ? "Administrador desativado." : "Administrador reativado." };
}

export async function resetAdminPasswordAction(
  id: string,
  password: string,
): Promise<AdminActionResult> {
  await requireAdmin();
  if (typeof id !== "string" || typeof password !== "string") {
    return { ok: false, error: "Pedido inválido." };
  }
  if (!meetsAllPasswordRules(password)) {
    return { ok: false, error: "A palavra-passe não cumpre todos os requisitos." };
  }

  try {
    const result = await resetAdminPassword(id, password);
    if (!result.ok) return result;
    await recordActivity({ action: "admin.password_reset", target: result.name });
  } catch {
    return { ok: false, error: "Não foi possível guardar. Tenta novamente." };
  }

  revalidatePath("/backoffice/administradores");
  return { ok: true, message: "Palavra-passe reposta. As sessões desse administrador terminaram." };
}
