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
import { formatShippingAddress } from "@/lib/shipping-address";

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
  const items = order.items ?? [];

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

      <Card>
        <CardHeader>
          <CardTitle>Artigos</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta encomenda não tem artigos registados (é anterior a esta funcionalidade ou é de
              demonstração): só guarda o número de artigos e o total.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.quantity} × {formatExactPrice(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatExactPrice(item.unitPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Morada de entrega</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {order.shipping ? (
            <address className="whitespace-pre-line text-sm not-italic text-foreground">
              {formatShippingAddress(order.shipping)}
              {order.shipping.phone ? `\nTel.: ${order.shipping.phone}` : ""}
            </address>
          ) : order.shippingHidden ? (
            <p className="text-sm text-muted-foreground">
              A morada é um dado pessoal e só é visível para quem trata de encomendas (perfil Total).
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta encomenda não tem morada registada (é anterior a esta funcionalidade ou é de
              demonstração).
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Mudar o estado não envia notificações nem mexe em pagamentos.
      </p>
    </>
  );
}
