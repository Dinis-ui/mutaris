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

/** Visão geral do estado da plataforma. */
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
    description: "Catálogo ligado à base de dados.",
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
    description: "Estado da ligação ao PostgreSQL.",
    tone: "neutral",
  },
];
