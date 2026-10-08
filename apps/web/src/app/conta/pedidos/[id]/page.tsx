import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { OrderStatusBadge } from "@/components/account/order-list";
import { getOrderById } from "@/lib/account";
import { formatDate, formatExactPrice } from "@/lib/format";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = getOrderById(id);
  return { title: order ? `Encomenda n.º ${order.number}` : "Encomenda" };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) notFound();

  return (
    <>
      <div className="flex flex-col gap-6">
        <Link
          href="/conta/pedidos"
          className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Todas as encomendas
        </Link>
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
            Encomenda n.º {order.number}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <OrderStatusBadge status={order.status} />
            <span>
              Feita a <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
            </span>
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <Card>
          <CardHeader>
            <CardTitle>Artigos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-4 first:pt-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatExactPrice(item.unitPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                {formatExactPrice(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress ? (
          <Card className="self-start">
            <CardHeader>
              <CardTitle>Morada de entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
