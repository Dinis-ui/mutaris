"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { PasswordStrength } from "@/components/account/password-strength";
import { TextField } from "@/components/account/fields";
import {
  resetAdminPasswordAction,
  setAdminDisabledAction,
  type AdminActionResult,
} from "@/app/backoffice/administradores/actions";

/** Desativar/reativar (com confirmação) e repor a palavra-passe de outro administrador. */
export function AdminRowActions({
  id,
  name,
  disabled,
}: {
  id: string;
  name: string;
  disabled: boolean;
}) {
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [result, setResult] = React.useState<AdminActionResult | null>(null);

  React.useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  function toggle() {
    if (!disabled && !confirming) return setConfirming(true);
    setConfirming(false);
    setResult(null);
    startTransition(async () => {
      try {
        setResult(await setAdminDisabledAction(id, !disabled));
      } catch {
        setResult({ ok: false, error: "Não foi possível guardar. Tenta novamente." });
      }
    });
  }

  function submitReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      try {
        const response = await resetAdminPasswordAction(id, password);
        setResult(response);
        if (response.ok) {
          setPassword("");
          setResetting(false);
        }
      } catch {
        setResult({ ok: false, error: "Não foi possível guardar. Tenta novamente." });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => setResetting((v) => !v)}>
          {resetting ? "Cancelar" : "Repor palavra-passe"}
        </Button>
        <Button
          type="button"
          variant={confirming ? "primary" : "ghost"}
          size="sm"
          disabled={pending}
          onClick={toggle}
        >
          {pending ? "A guardar…" : disabled ? "Reativar" : confirming ? "Confirmar?" : "Desativar"}
        </Button>
      </div>
      {resetting ? (
        <form onSubmit={submitReset} noValidate className="flex w-full max-w-sm flex-col gap-3 text-left">
          <TextField
            label={`Nova palavra-passe para ${name}`}
            name={`reset-${id}`}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength value={password} />
          <div>
            <Button type="submit" size="sm" disabled={pending}>
              Guardar nova palavra-passe
            </Button>
          </div>
        </form>
      ) : null}
      {result ? (
        <p role={result.ok ? "status" : "alert"} className="max-w-xs text-xs text-muted-foreground">
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
    </div>
  );
}
