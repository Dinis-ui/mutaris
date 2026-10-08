import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CircleHelp, LifeBuoy, MessageSquare } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { AccountPageHeader } from "@/components/account/page-header";
import { EmptyState } from "@/components/account/empty-state";
import { StatusBadge, type StatusTone } from "@/components/account/status-badge";
import { SupportRequestForm } from "@/components/account/support-request-form";
import { supportTickets } from "@/data/account";
import { ticketStatusLabel } from "@/lib/account";
import { formatDate } from "@/lib/format";
import type { SupportTicketStatus } from "@workspace/types";

export const metadata: Metadata = { title: "Suporte" };

const ticketTone: Record<SupportTicketStatus, StatusTone> = {
  open: "neutral",
  "awaiting-reply": "attention",
  resolved: "muted",
};

const helpLinks = [
  {
    label: "Guias de instalação",
    description: "Passo a passo para instalar e configurar os teus equipamentos.",
    href: "/guias",
    icon: BookOpen,
  },
  {
    label: "Perguntas frequentes",
    description: "Respostas rápidas às dúvidas mais comuns.",
    href: "/suporte",
    icon: CircleHelp,
  },
  {
    label: "Contactos",
    description: "Outras formas de falar com a nossa equipa.",
    href: "/contactos",
    icon: MessageSquare,
  },
];

export default function SupportPage() {
  return (
    <>
      <AccountPageHeader
        title="Suporte"
        description="Precisas de ajuda com uma encomenda ou com uma solução? Estamos aqui."
      />

      <section aria-labelledby="ajuda-rapida" className="flex flex-col gap-4">
        <h2 id="ajuda-rapida" className="text-lg font-semibold text-foreground">
          Ajuda rápida
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {helpLinks.map((link) => (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <link.icon aria-hidden="true" className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">{link.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <SupportRequestForm />

      <section aria-labelledby="historico" className="flex flex-col gap-4">
        <h2 id="historico" className="text-lg font-semibold text-foreground">
          Histórico de pedidos de suporte
        </h2>
        {supportTickets.length > 0 ? (
          <Card>
            <ul className="divide-y divide-border px-5 sm:px-6">
              {supportTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{ticket.subject}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Pedido n.º {ticket.reference} ·{" "}
                      <time dateTime={ticket.createdAt}>{formatDate(ticket.createdAt)}</time>
                    </p>
                  </div>
                  <StatusBadge
                    label={ticketStatusLabel[ticket.status]}
                    tone={ticketTone[ticket.status]}
                  />
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            icon={LifeBuoy}
            title="Ainda não fizeste nenhum pedido de suporte"
            description="Quando pedires ajuda, vais poder acompanhar aqui o estado de cada pedido."
          />
        )}
      </section>
    </>
  );
}
