/**
 * Dados mockados do Dashboard do backoffice.
 *
 * Não existe ainda backend nem base de dados: estes valores servem apenas
 * para desenhar a interface. Quando o PostgreSQL/API estiver disponível,
 * `lib/backoffice.ts` passa a ir buscar estes dados a sério — os
 * componentes não precisam de mudar.
 */

export interface SummaryCardData {
  id: string;
  label: string;
  value: string;
  description: string;
}

export type ActivityTone = "neutral" | "positive" | "attention";

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone: ActivityTone;
}

export type PlatformStatusTone = "positive" | "attention" | "neutral";

export interface PlatformStatusItem {
  id: string;
  label: string;
  description: string;
  tone: PlatformStatusTone;
}

/** As 5 entradas mais recentes de atividade — dados de demonstração. */
export const mockActivity: ActivityItem[] = [
  {
    id: "act-1",
    title: "Nova conta criada",
    description: "Um novo utilizador registou-se na área de cliente.",
    timestamp: "Há 12 minutos",
    tone: "neutral",
  },
  {
    id: "act-2",
    title: "Pedido de suporte aberto",
    description: "Um cliente abriu um novo pedido de suporte.",
    timestamp: "Há 48 minutos",
    tone: "attention",
  },
  {
    id: "act-3",
    title: "Encomenda confirmada",
    description: "Uma encomenda de demonstração foi marcada como confirmada.",
    timestamp: "Há 2 horas",
    tone: "positive",
  },
  {
    id: "act-4",
    title: "Produto atualizado",
    description: "A descrição de um produto da loja foi editada.",
    timestamp: "Ontem",
    tone: "neutral",
  },
  {
    id: "act-5",
    title: "Pedido de suporte resolvido",
    description: "Um pedido de suporte em aberto foi marcado como resolvido.",
    timestamp: "Há 2 dias",
    tone: "positive",
  },
];

/** Visão geral do estado da plataforma — dados de demonstração. */
export const platformStatus: PlatformStatusItem[] = [
  {
    id: "site",
    label: "Site público",
    description: "Todas as páginas públicas estão acessíveis.",
    tone: "positive",
  },
  {
    id: "loja",
    label: "Loja",
    description: "Catálogo a funcionar com dados de demonstração.",
    tone: "positive",
  },
  {
    id: "encomendas",
    label: "Encomendas e pagamentos",
    description: "Checkout e pagamentos ainda não estão implementados.",
    tone: "attention",
  },
  {
    id: "contas",
    label: "Contas de cliente",
    description: "Autenticação ainda não está ligada a um backend real.",
    tone: "attention",
  },
  {
    id: "base-de-dados",
    label: "Base de dados",
    description: "Ainda não existe ligação a PostgreSQL — dados em memória/mock.",
    tone: "neutral",
  },
];
