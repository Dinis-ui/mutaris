"use client";

import * as React from "react";
import type { SupportTicketStatus } from "@workspace/types";
import { Button } from "@workspace/ui/components/button";
import { ticketStatusLabel } from "@/lib/account";
import { setTicketStatusAction } from "@/app/backoffice/suporte/actions";

function useTicketStatusChange(ticketId: string) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  function change(next: SupportTicketStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setTicketStatusAction(ticketId, next);
      if (!result.ok) setError(result.error);
    });
  }

  return { pending, error, change };
}

/** Atalho para a tabela: "Resolver" ou, se já resolvido, "Reabrir". */
export function TicketQuickAction({
  ticketId,
  status,
}: {
  ticketId: string;
  status: SupportTicketStatus;
}) {
  const { pending, error, change } = useTicketStatusChange(ticketId);
  const resolved = status === "resolved";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => change(resolved ? "open" : "resolved")}
      >
        {pending ? "A guardar…" : resolved ? "Reabrir" : "Resolver"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const ORDER: SupportTicketStatus[] = ["open", "awaiting-reply", "resolved"];

/** Seletor dos três estados, para a página de detalhe. */
export function TicketStatusPicker({
  ticketId,
  status,
}: {
  ticketId: string;
  status: SupportTicketStatus;
}) {
  const { pending, error, change } = useTicketStatusChange(ticketId);

  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Estado do pedido" className="flex flex-wrap gap-2">
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
            {ticketStatusLabel[option]}
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
