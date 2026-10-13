"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { revokeOtherSessionsAction, type ActionResult } from "@/app/conta/actions";

export function RevokeSessionsButton({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onClick() {
    startTransition(async () => {
      try {
        setResult(await revokeOtherSessionsAction());
      } catch {
        setResult({ ok: false, error: "Não foi possível terminar as sessões. Tenta novamente." });
      }
    });
  }

  return (
    <div className="mt-4 flex flex-col items-start gap-3">
      <Button type="button" variant="secondary" size="sm" onClick={onClick} disabled={disabled || pending}>
        {pending ? "A terminar…" : "Terminar as outras sessões"}
      </Button>
      {result ? (
        <p role={result.ok ? "status" : "alert"} className="text-sm text-foreground">
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
    </div>
  );
}
