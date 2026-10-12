import type { ActivityTone } from "@/data/backoffice-dashboard";

/**
 * Ações registadas no registo de atividade. O código (`action`) fica na
 * base de dados; o título e o tom vêm daqui, por isso podem mudar sem
 * migrações. Sem dependências de servidor.
 */
export type ActivityAction =
  | "admin.login"
  | "admin.logout"
  | "user.suspended"
  | "user.reactivated"
  | "ticket.status_changed"
  | "order.status_changed"
  | "product.created"
  | "product.updated"
  | "product.deleted";

export const ACTIVITY_ACTIONS: Record<string, { title: string; tone: ActivityTone }> = {
  "admin.login": { title: "Início de sessão", tone: "neutral" },
  "admin.logout": { title: "Sessão terminada", tone: "neutral" },
  "user.suspended": { title: "Utilizador suspenso", tone: "attention" },
  "user.reactivated": { title: "Utilizador reativado", tone: "positive" },
  "ticket.status_changed": { title: "Pedido de suporte atualizado", tone: "neutral" },
  "order.status_changed": { title: "Encomenda atualizada", tone: "neutral" },
  "product.created": { title: "Produto criado", tone: "positive" },
  "product.updated": { title: "Produto editado", tone: "neutral" },
  "product.deleted": { title: "Produto removido", tone: "attention" },
};
