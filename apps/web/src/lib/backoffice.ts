import { getProducts } from "@/lib/products";
import {
  mockActivity,
  platformStatus,
  type ActivityItem,
  type PlatformStatusItem,
  type SummaryCardData,
} from "@/data/backoffice-dashboard";
import { adminSupportTickets, type AdminSupportTicket } from "@/data/backoffice-support";
import { adminUsers, type AdminUser } from "@/data/backoffice-users";
import { adminOrders, type AdminOrder } from "@/data/backoffice-orders";

/**
 * Tal como em `lib/products.ts`, os componentes do backoffice chamam estas
 * funções em vez de importar os dados mock diretamente. Quando existir
 * PostgreSQL/API, só este ficheiro precisa de mudar para ir buscar dados a
 * sério (incluindo passar as funções a `async`) — os componentes mantêm-se
 * iguais.
 */

export function getDashboardSummary(): SummaryCardData[] {
  const produtosNaLoja = getProducts().length;
  const suporteEmAberto = adminSupportTickets.filter(
    (ticket) => ticket.status !== "resolved",
  ).length;

  return [
    {
      id: "utilizadores",
      label: "Utilizadores",
      value: String(adminUsers.length),
      description: "Contas de demonstração na área de cliente.",
    },
    {
      id: "encomendas",
      label: "Encomendas",
      value: String(adminOrders.length),
      description: "Total de encomendas de demonstração.",
    },
    {
      id: "produtos",
      label: "Produtos na loja",
      value: String(produtosNaLoja),
      description: "Produtos atualmente no catálogo.",
    },
    {
      id: "suporte",
      label: "Suporte em aberto",
      value: String(suporteEmAberto),
      description: "Pedidos de suporte ainda sem resposta.",
    },
  ];
}

export function getRecentActivity(): ActivityItem[] {
  return mockActivity;
}

export function getPlatformStatus(): PlatformStatusItem[] {
  return platformStatus;
}

export function getSupportTickets(): AdminSupportTicket[] {
  return adminSupportTickets;
}

export function getUsers(): AdminUser[] {
  return adminUsers;
}

export function getOrders(): AdminOrder[] {
  return adminOrders;
}
