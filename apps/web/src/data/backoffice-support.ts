import type { SupportTicketStatus } from "@workspace/types";

/**
 * Pedidos de suporte mockados para o backoffice.
 *
 * Não existe ainda um sistema de suporte real nem base de dados — estes
 * dados servem só para desenhar a interface de gestão. Os nomes de
 * cliente são fictícios (`isDemo: true`). Quando houver pedidos reais,
 * só `lib/backoffice.ts` precisa de mudar para os ir buscar a sério.
 */
export interface AdminSupportTicket {
  id: string;
  reference: string;
  subject: string;
  customerName: string;
  status: SupportTicketStatus;
  /** ISO 8601 date. */
  createdAt: string;
  isDemo: boolean;
}

export const adminSupportTickets: AdminSupportTicket[] = [
  {
    id: "ticket-1",
    reference: "SUP-1042",
    subject: "Câmara exterior não liga",
    customerName: "Cliente de demonstração 1",
    status: "open",
    createdAt: "2026-10-07",
    isDemo: true,
  },
  {
    id: "ticket-2",
    reference: "SUP-1041",
    subject: "Dúvida sobre instalação do sensor de abertura",
    customerName: "Cliente de demonstração 2",
    status: "awaiting-reply",
    createdAt: "2026-10-06",
    isDemo: true,
  },
  {
    id: "ticket-3",
    reference: "SUP-1038",
    subject: "Alteração de morada de entrega",
    customerName: "Cliente de demonstração 3",
    status: "resolved",
    createdAt: "2026-10-03",
    isDemo: true,
  },
  {
    id: "ticket-4",
    reference: "SUP-1035",
    subject: "App não mostra o vídeo em direto",
    customerName: "Cliente de demonstração 1",
    status: "open",
    createdAt: "2026-10-01",
    isDemo: true,
  },
  {
    id: "ticket-5",
    reference: "SUP-1030",
    subject: "Pergunta sobre garantia do sensor de movimento",
    customerName: "Cliente de demonstração 4",
    status: "resolved",
    createdAt: "2026-09-27",
    isDemo: true,
  },
];
