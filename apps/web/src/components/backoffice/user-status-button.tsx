"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import type { AdminUserStatus } from "@/data/backoffice-users";
import { setUserStatusAction } from "@/app/backoffice/utilizadores/actions";

/**
 * Botão de suspender/reativar. Suspender pede uma segunda confirmação
 * (o botão muda para "Confirmar?" durante 4 segundos). Reativar é direto.
 */
export function UserStatusButton({
  userId,
  status,
  size = "sm",
}: {
  userId: string;
  status: AdminUserStatus;
  size?: "sm" | "md";
}) {
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSuspended = status === "suspended";

  React.useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  function run(next: "active" | "suspended") {
    setError(null);
    setConfirming(false);
    startTransition(async () => {
      const result = await setUserStatusAction(userId, next);
      if (!result.ok) setError(result.error);
    });
  }

  function onClick() {
    if (isSuspended) return run("active");
    if (!confirming) return setConfirming(true);
    run("suspended");
  }

  const label = pending
    ? "A guardar…"
    : isSuspended
      ? "Reativar"
      : confirming
        ? "Confirmar?"
        : "Suspender";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={confirming ? "primary" : "ghost"}
        size={size}
        disabled={pending}
        onClick={onClick}
      >
        {label}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
