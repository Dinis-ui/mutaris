"use server";

import { headers } from "next/headers";
import { requireAdmin, getCurrentAdminSessionHash } from "@/lib/backoffice-session-server";
import { recordActivity } from "@/lib/audit";
import { changeOwnPassword } from "@/lib/backoffice-admin-accounts";
import { clearFailures, isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";
import { meetsAllPasswordRules } from "@/lib/password";

export type OwnPasswordResult = { ok: true; message: string } | { ok: false; error: string };

export async function changeOwnPasswordAction(input: {
  current: string;
  next: string;
  confirm: string;
}): Promise<OwnPasswordResult> {
  const admin = await requireAdmin();

  const current = typeof input?.current === "string" ? input.current : "";
  const next = typeof input?.next === "string" ? input.next : "";
  const confirm = typeof input?.confirm === "string" ? input.confirm : "";

  if (!current) return { ok: false, error: "Indica a palavra-passe atual." };
  if (!meetsAllPasswordRules(next)) {
    return { ok: false, error: "A nova palavra-passe não cumpre todos os requisitos." };
  }
  if (next !== confirm) return { ok: false, error: "As palavras-passe não coincidem." };
  if (next === current) return { ok: false, error: "A nova palavra-passe tem de ser diferente." };

  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const attempt = {
    ip: forwarded.split(",")[0]?.trim() || "unknown",
    email: admin.id,
    scope: "password" as const,
  };

  try {
    if (await isRateLimited(attempt)) {
      return { ok: false, error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." };
    }
    const result = await changeOwnPassword(
      admin.id,
      current,
      next,
      await getCurrentAdminSessionHash(),
    );
    if (result === "wrong-current") {
      await registerFailure(attempt);
      return { ok: false, error: "A palavra-passe atual está incorreta." };
    }
    await clearFailures(attempt);
    await recordActivity({ action: "admin.password_changed", target: admin.name });
  } catch {
    return { ok: false, error: "Não foi possível alterar a palavra-passe. Tenta novamente." };
  }

  return { ok: true, message: "Palavra-passe alterada. As tuas outras sessões foram terminadas." };
}
