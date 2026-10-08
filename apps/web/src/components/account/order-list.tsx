import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { StatusBadge, type StatusTone } from "@/components/account/status-badge";
import { formatDate, formatExactPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/account";
import type { Order, OrderStatus } from "@workspace/types";

export const orderStatusTone: Record<OrderStatus, StatusTone> = {
  "awaiting-payment": "attention",
  processing: "neutral",
  shipped: "neutral",
  delivered: "positive",
  cancelled: "muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge label={orderStatusLabel[status]} tone={orderStatusTone[status]} />;
}

export function OrderList({ orders }: { orders: Order[] }) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-border">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/conta/pedidos/${order.id}`}
              className="group flex flex-col gap-3 p-5 transition-colors hover:bg-ink-3 focus-visible:bg-ink-3 focus-visible:outline-none sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-semibold text-foreground">
                  Encomenda n.º {order.number}
                </span>
                <span className="text-sm text-muted-foreground">
                  <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                <OrderStatusBadge status={order.status} />
                <span className="min-w-20 text-sm font-semibold text-foreground sm:text-right">
                  {formatExactPrice(order.total)}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
