import { orders } from "@/data/account";
import type { Order, OrderStatus, OwnedSolutionStatus, SupportTicketStatus } from "@workspace/types";

/**
 * Data access for the account area. Today it reads static frontend data;
 * swap these implementations for real requests once a backend exists.
 */
export function getOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  "awaiting-payment": "A aguardar pagamento",
  processing: "Em preparação",
  shipped: "Enviada",
  delivered: "Entregue",
  cancelled: "Cancelada",
};

export const solutionStatusLabel: Record<OwnedSolutionStatus, string> = {
  active: "Ativa",
  "setup-pending": "Por configurar",
  "needs-attention": "Requer atenção",
};

export const ticketStatusLabel: Record<SupportTicketStatus, string> = {
  open: "Aberto",
  "awaiting-reply": "A aguardar resposta",
  resolved: "Resolvido",
};
