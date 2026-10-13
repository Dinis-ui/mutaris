import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { TicketStatusPicker } from "@/components/backoffice/ticket-status-control";
import { getTicketDetail } from "@/lib/backoffice-support";
import { supportCategories } from "@/lib/support";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Pedido de suporte",
};

export default async function BackofficeTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getTicketDetail(id);
  if (!detail) notFound();

  const { ticket, updatedAt, category, message } = detail;
  const categoryLabel = supportCategories.find((item) => item.value === category)?.label;

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/backoffice/suporte">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Suporte
          </Link>
        </Button>
        <BackofficePageHeader title={ticket.subject} description={ticket.reference} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-0">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-4 sm:gap-8">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd className="font-medium text-foreground">
                {ticket.userId ? (
                  <Link
                    href={`/backoffice/utilizadores/${ticket.userId}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {ticket.customerName}
                  </Link>
                ) : (
                  ticket.customerName
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Aberto em</dt>
              <dd className="font-medium text-foreground">{formatDate(ticket.createdAt)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Última alteração</dt>
              <dd className="font-medium text-foreground">{formatDate(updatedAt)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Origem</dt>
              <dd>{ticket.isDemo ? <Badge variant="outline">Demo</Badge> : "Pedido real"}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Estado</p>
            <TicketStatusPicker ticketId={ticket.id} status={ticket.status} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem do cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {message ? (
            <>
              {categoryLabel ? (
                <p className="text-sm text-muted-foreground">Tipo de pedido: {categoryLabel}</p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm text-foreground">{message}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este pedido não tem mensagem (é um pedido de demonstração ou anterior a esta funcionalidade).
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        A conversa com o cliente (respostas) ainda não está implementada: aqui só se gere o estado.
      </p>
    </>
  );
}
