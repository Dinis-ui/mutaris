"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { deleteProductAction } from "@/app/backoffice/loja/actions";

/**
 * Botão de remover produto. Pede uma segunda confirmação (o botão muda
 * para "Confirmar?" durante 4 segundos). Remover é definitivo.
 */
export function ProductDeleteButton({ productId }: { productId: string }) {
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  function onClick() {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={confirming ? "primary" : "ghost"}
        size="sm"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "A remover…" : confirming ? "Confirmar?" : "Remover"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
