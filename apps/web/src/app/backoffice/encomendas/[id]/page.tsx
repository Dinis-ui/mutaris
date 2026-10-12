import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { OrderStatusPicker } from "@/components/backoffice/order-status-control";
import { getOrderDetail } from "@/lib/backoffice-orders";
import { formatDate, formatExactPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Encomenda",
};

export default async function BackofficeOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/backoffice/encomendas">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Encomendas
          </Link>
        </Button>
        <BackofficePageHeader
          title={order.number}
          description={`${order.itemCount} ${order.itemCount === 1 ? "artigo" : "artigos"} · ${formatExactPrice(order.total)}`}
        />
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
                {order.userId ? (
                  <Link
                    href={`/backoffice/utilizadores/${order.userId}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {order.customerName}
                  </Link>
                ) : (
                  order.customerName
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Data</dt>
              <dd className="font-medium text-foreground">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-medium text-foreground">{formatExactPrice(order.total)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Origem</dt>
              <dd>{order.isDemo ? <Badge variant="outline">Demo</Badge> : "Encomenda real"}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Estado</p>
            <OrderStatusPicker orderId={order.id} status={order.status} />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        As encomendas ainda não têm artigos nem morada: só guardam o número de artigos e o total.
        Mudar o estado não envia notificações nem mexe em pagamentos.
      </p>
    </>
  );
}
