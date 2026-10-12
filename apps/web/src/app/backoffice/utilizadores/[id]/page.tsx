import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { UserStatusButton } from "@/components/backoffice/user-status-button";
import { getUserDetail } from "@/lib/backoffice-users";
import { orderStatusLabel, ticketStatusLabel } from "@/lib/account";
import { formatDate, formatExactPrice } from "@/lib/format";
import { adminUserStatusLabel } from "@/data/backoffice-users";

export const metadata: Metadata = {
  title: "Utilizador",
};

export default async function BackofficeUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getUserDetail(id);
  if (!detail) notFound();

  const { user, tickets, orders } = detail;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/backoffice/utilizadores">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Utilizadores
          </Link>
        </Button>
        <BackofficePageHeader title={user.name} description={user.email} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-0 sm:flex-row sm:items-start sm:justify-between">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Estado</dt>
              <dd className="font-medium text-foreground">{adminUserStatusLabel[user.status]}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Registo</dt>
              <dd className="font-medium text-foreground">{formatDate(user.createdAt)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Origem</dt>
              <dd>{user.isDemo ? <Badge variant="outline">Demo</Badge> : "Conta real"}</dd>
            </div>
          </dl>
          <UserStatusButton userId={user.id} status={user.status} size="md" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos de suporte ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem pedidos de suporte.</p>
          ) : (
            <ul className="flex flex-col">
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-3 text-sm first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{ticket.subject}</span>
                    <span className="text-muted-foreground">
                      {ticket.reference} · {formatDate(ticket.createdAt)}
                    </span>
                  </div>
                  <span className="text-muted-foreground">{ticketStatusLabel[ticket.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encomendas ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem encomendas.</p>
          ) : (
            <ul className="flex flex-col">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-3 text-sm first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{order.number}</span>
                    <span className="text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "artigo" : "artigos"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{orderStatusLabel[order.status]}</span>
                    <span className="font-medium text-foreground">
                      {formatExactPrice(order.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
