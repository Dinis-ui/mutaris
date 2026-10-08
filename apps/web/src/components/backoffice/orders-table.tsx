"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { formatDate, formatExactPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/account";
import type { AdminOrder } from "@/data/backoffice-orders";
import type { OrderStatus } from "@workspace/types";

const STATUS_DOT: Record<OrderStatus, string> = {
  "awaiting-payment": "bg-paper-dim",
  processing: "bg-foreground",
  shipped: "bg-foreground",
  delivered: "bg-primary",
  cancelled: "bg-paper-faint",
};

const STATUS_FILTERS: { value: OrderStatus | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "awaiting-payment", label: orderStatusLabel["awaiting-payment"] },
  { value: "processing", label: orderStatusLabel.processing },
  { value: "shipped", label: orderStatusLabel.shipped },
  { value: "delivered", label: orderStatusLabel.delivered },
  { value: "cancelled", label: orderStatusLabel.cancelled },
];

/**
 * Lista de encomendas. Pesquisa e filtro só no frontend, sobre dados
 * mockados. "Ver" aparece mas está desativado — ainda não há encomendas
 * nem pagamentos reais.
 */
export function BackofficeOrdersTable({ orders }: { orders: AdminOrder[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "todas">("todas");

  const filtered = orders.filter((order) => {
    const matchesStatus = status === "todas" || order.status === status;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      order.number.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar por número ou cliente…"
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
            Nenhuma encomenda encontrada.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Encomenda</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">#{order.number}</span>
                        {order.isDemo ? <Badge variant="outline">Demo</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {order.itemCount} {order.itemCount === 1 ? "artigo" : "artigos"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[order.status])}
                        />
                        {orderStatusLabel[order.status]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {formatExactPrice(order.total)}
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
        “Ver” ainda não está disponível — não existem encomendas nem pagamentos reais, e os valores
        acima são fictícios.
      </p>
    </div>
  );
}
