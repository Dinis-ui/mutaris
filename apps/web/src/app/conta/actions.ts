"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireUser, getCurrentSessionHash } from "@/lib/customer-session-server";
import {
  changePassword,
  createTicket,
  revokeOtherSessions,
  updateProfile,
} from "@/lib/customer-account";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/customer-auth";
import { clearFailures, isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";
import { validatePasswordChange } from "@/lib/password";
import {
  SUPPORT_MESSAGE_MAX_LENGTH,
  SUPPORT_SUBJECT_MAX_LENGTH,
  isSupportCategory,
  validateSupportRequest,
  type SupportCategory,
} from "@/lib/support";

/**
 * Ações da área de cliente. Cada ação é um endpoint público: valida a sessão
 * e todos os argumentos de novo, mesmo que o formulário já o tenha feito.
 */

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fields?: Record<string, string> };

const GENERIC_ERROR = "Não foi possível concluir o pedido. Tenta novamente.";
const PHONE_PATTERN = /^[+\d][\d\s-]{5,19}$/;

function text(value: unknown, max: number): string | null {
  return typeof value === "string" && value.length <= max ? value : null;
}

export async function updateProfileAction(input: {
  name: string;
  phone: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const name = text(input?.name, 500)?.trim() ?? "";
  const phone = text(input?.phone, 100)?.trim() ?? "";

  const fields: Record<string, string> = {};
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    fields.name = `O nome deve ter entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres.`;
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    fields.phone = "Indica um número de telefone válido.";
  }
  if (Object.keys(fields).length > 0) {
    return { ok: false, error: "Corrige os campos assinalados.", fields };
  }

  try {
    await updateProfile(user.id, { name, phone });
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidatePath("/conta", "layout");
  return { ok: true, message: "Dados guardados." };
}

export async function changePasswordAction(input: {
  current: string;
  next: string;
  confirm: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const current = text(input?.current, PASSWORD_MAX_LENGTH) ?? "";
  const next = text(input?.next, PASSWORD_MAX_LENGTH) ?? "";
  const confirm = text(input?.confirm, PASSWORD_MAX_LENGTH) ?? "";

  const errors = validatePasswordChange({ current, next, confirm });
  const first = Object.values(errors)[0];
  if (first) return { ok: false, error: first, fields: errors as Record<string, string> };

  const store = await headers();
  const ip = store.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  // A chave usa o id do cliente: limita as tentativas à palavra-passe atual.
  const attempt = { ip, email: user.id, scope: "password" as const };

  try {
    if (await isRateLimited(attempt)) {
      return { ok: false, error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." };
    }

    const result = await changePassword(user.id, current, next, await getCurrentSessionHash());
    if (result === "wrong-current") {
      await registerFailure(attempt);
      return {
        ok: false,
        error: "A palavra-passe atual está incorreta.",
        fields: { current: "A palavra-passe atual está incorreta." },
      };
    }
    if (result === "no-password") return { ok: false, error: GENERIC_ERROR };

    await clearFailures(attempt);
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath("/conta/seguranca");
  return {
    ok: true,
    message: "Palavra-passe alterada. As sessões noutros dispositivos foram terminadas.",
  };
}

export async function revokeOtherSessionsAction(): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await revokeOtherSessions(user.id, await getCurrentSessionHash());
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidatePath("/conta/seguranca");
  return { ok: true, message: "As outras sessões foram terminadas." };
}

export async function createSupportTicketAction(input: {
  category: string;
  subject: string;
  message: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const subject = typeof input?.subject === "string" ? input.subject.trim() : "";
  const message = typeof input?.message === "string" ? input.message.trim() : "";
  const category: SupportCategory = isSupportCategory(String(input?.category))
    ? (input.category as SupportCategory)
    : "other";

  const errors = validateSupportRequest({ category, subject, message });
  if (subject.length > SUPPORT_SUBJECT_MAX_LENGTH) {
    errors.subject = `O assunto pode ter no máximo ${SUPPORT_SUBJECT_MAX_LENGTH} caracteres.`;
  }
  if (message.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    errors.message = `A mensagem pode ter no máximo ${SUPPORT_MESSAGE_MAX_LENGTH} caracteres.`;
  }
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Corrige os campos assinalados.", fields: errors as Record<string, string> };
  }

  try {
    const result = await createTicket(user.id, { category, subject, message });
    if (result.status === "rate-limited") {
      return {
        ok: false,
        error: "Já enviaste vários pedidos na última hora. Tenta novamente mais tarde.",
      };
    }
    revalidatePath("/conta/suporte");
    revalidatePath("/conta");
    revalidatePath("/backoffice/suporte");
    return { ok: true, message: `Pedido enviado. A referência é ${result.reference}.` };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
