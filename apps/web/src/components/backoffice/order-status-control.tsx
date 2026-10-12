"use client";

import * as React from "react";
import type { OrderStatus } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { orderStatusLabel } from "@/lib/account";
import { setOrderStatusAction } from "@/app/backoffice/encomendas/actions";

function useOrderStatusChange(orderId: string) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function change(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setOrderStatusAction(orderId, next);
      if (!result.ok) setError(result.error);
    });
  }

  return { pending, error, change };
}

/** Próximo passo normal de uma encomenda e o texto do botão. */
const NEXT_STEP: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  "awaiting-payment": { next: "processing", label: "Marcar paga" },
  processing: { next: "shipped", label: "Marcar enviada" },
  shipped: { next: "delivered", label: "Marcar entregue" },
};

/** Atalho para a tabela: avança a encomenda para o passo seguinte. */
export function OrderQuickAction({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const { pending, error, change } = useOrderStatusChange(orderId);
  const step = NEXT_STEP[status];
  if (!step) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => change(step.next)}
      >
        {pending ? "A guardar…" : step.label}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const ORDER: OrderStatus[] = ["awaiting-payment", "processing", "shipped", "delivered", "cancelled"];

/** Seletor de todos os estados, para a página de detalhe. */
export function OrderStatusPicker({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const { pending, error, change } = useOrderStatusChange(orderId);

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Estado da encomenda" className="flex flex-wrap gap-2">
        {ORDER.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={option === status ? "primary" : "secondary"}
            aria-pressed={option === status}
            disabled={pending || option === status}
            onClick={() => change(option)}
          >
            {orderStatusLabel[option]}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
