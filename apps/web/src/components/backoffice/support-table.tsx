"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { formatDate } from "@/lib/format";
import { ticketStatusLabel } from "@/lib/account";
import type { AdminSupportTicket } from "@/data/backoffice-support";
import type { SupportTicketStatus } from "@workspace/types";

const STATUS_DOT: Record<SupportTicketStatus, string> = {
  open: "bg-foreground",
  "awaiting-reply": "bg-paper-dim",
  resolved: "bg-primary",
};

const STATUS_FILTERS: { value: SupportTicketStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "open", label: ticketStatusLabel.open },
  { value: "awaiting-reply", label: ticketStatusLabel["awaiting-reply"] },
  { value: "resolved", label: ticketStatusLabel.resolved },
];

/**
 * Lista de pedidos de suporte. Pesquisa e filtro de estado só no
 * frontend, sobre dados mockados. "Ver" aparece mas está desativado —
 * ainda não há um sistema de suporte real por trás.
 */
export function BackofficeSupportTable({ tickets }: { tickets: AdminSupportTicket[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<SupportTicketStatus | "todos">("todos");

  const filtered = tickets.filter((ticket) => {
    const matchesStatus = status === "todos" || ticket.status === status;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      ticket.subject.toLowerCase().includes(q) ||
      ticket.customerName.toLowerCase().includes(q) ||
      ticket.reference.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por cliente, assunto ou referência…"
            className="h-11 pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                status === filter.value
                  ? "border-line-strong bg-card text-foreground"
                  : "border-border text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Nenhum pedido de suporte encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Referência</th>
                  <th className="px-6 py-3 font-medium">Assunto</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4 font-medium text-foreground">{ticket.reference}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-foreground">{ticket.subject}</span>
                        {ticket.isDemo ? <Badge variant="outline">Demo</Badge> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{ticket.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[ticket.status])}
                        />
                        {ticketStatusLabel[ticket.status]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="secondary" size="sm" disabled>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        “Ver” ainda não está disponível — não há um sistema de suporte real ligado a estes pedidos.
      </p>
    </div>
  );
}
