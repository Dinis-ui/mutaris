"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { PasswordStrength } from "@/components/account/password-strength";
import { TextField } from "@/components/account/fields";
import {
  changeOwnPasswordAction,
  type OwnPasswordResult,
} from "@/app/backoffice/conta/actions";

export function AdminOwnPasswordForm() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [result, setResult] = React.useState<OwnPasswordResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await changeOwnPasswordAction({ current, next, confirm });
        setResult(response);
        if (response.ok) {
          setCurrent("");
          setNext("");
          setConfirm("");
        }
      } catch {
        setResult({ ok: false, error: "Não foi possível alterar a palavra-passe. Tenta novamente." });
      }
    });
  }

  const clear = (setValue: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setResult(null);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-5">
      <TextField
        label="Palavra-passe atual"
        name="current-password"
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={clear(setCurrent)}
      />
      <TextField
        label="Nova palavra-passe"
        name="new-password"
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={clear(setNext)}
      />
      <PasswordStrength value={next} />
      <TextField
        label="Confirmar nova palavra-passe"
        name="confirm-password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={clear(setConfirm)}
      />
      {result ? (
        <p role={result.ok ? "status" : "alert"} className="text-sm text-foreground">
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "A alterar…" : "Alterar palavra-passe"}
        </Button>
      </div>
    </form>
  );
}
