import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import type { ActivityAction } from "@/lib/audit-actions";
import { getCurrentAdmin } from "@/lib/backoffice-session-server";

/**
 * Regista uma ação de administrador no registo de atividade (só servidor).
 * Nunca falha: se não for possível registar, o erro vai para o log do
 * servidor e a ação que o chamou continua — o registo é informação, não
 * pode impedir o trabalho.
 *
 * Sem `actor`, usa o administrador da sessão atual.
 */
export async function recordActivity(input: {
  action: ActivityAction;
  target?: string;
  actor?: { id: string; name: string };
}): Promise<void> {
  try {
    const actor = input.actor ?? (await getCurrentAdmin());
    if (!actor) return;

    await getDb().insert(auditLog).values({
      adminId: actor.id,
      actorName: actor.name,
      action: input.action,
      target: input.target ?? "",
    });
  } catch (error) {
    console.error("Não foi possível registar a atividade:", error);
  }
}
