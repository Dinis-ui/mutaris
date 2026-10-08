"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { formatDate } from "@/lib/format";
import {
  adminUserStatusLabel,
  type AdminUser,
  type AdminUserStatus,
} from "@/data/backoffice-users";

const STATUS_DOT: Record<AdminUserStatus, string> = {
  active: "bg-primary",
  pending: "bg-paper-dim",
  suspended: "bg-foreground",
};

const STATUS_FILTERS: { value: AdminUserStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "active", label: adminUserStatusLabel.active },
  { value: "pending", label: adminUserStatusLabel.pending },
  { value: "suspended", label: adminUserStatusLabel.suspended },
];

/**
 * Lista de utilizadores. Pesquisa e filtro só no frontend, sobre dados
 * mockados. "Ver" e "Suspender" aparecem mas estão desativados — ainda não
 * há contas reais nem escrita.
 */
export function BackofficeUsersTable({ users }: { users: AdminUser[] }) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<AdminUserStatus | "todos">("todos");

  const filtered = users.filter((user) => {
    const matchesStatus = status === "todos" || user.status === status;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
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
            placeholder="Pesquisar por nome ou email…"
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
            Nenhum utilizador encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Registo</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{user.name}</span>
                        {user.isDemo ? <Badge variant="outline">Demo</Badge> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[user.status])}
                        />
                        {adminUserStatusLabel[user.status]}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" disabled>
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          Suspender
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        “Ver” e “Suspender” ainda não estão disponíveis — não existem contas reais nem escrita na
        base de dados.
      </p>
    </div>
  );
}
