"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { TextField } from "@/components/account/fields";
import { deleteAccountAction, type ActionResult } from "@/app/conta/actions";

/** Eliminar a conta: dois passos (abrir o formulário e confirmar com a palavra-passe). */
export function DeleteAccountForm() {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | undefined>();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setFieldError(undefined);
    startTransition(async () => {
      try {
        const response = await deleteAccountAction({ password });
        if (response.ok) {
          // A conta (e a sessão) já não existem. Recarregamento completo, para o menu do
          // cabeçalho (que guarda o estado de sessão) voltar a verificar.
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.assign("/");
          return;
        }
        setResult(response);
        setFieldError(response.fields?.password);
      } catch {
        setResult({ ok: false, error: "Não foi possível eliminar a conta. Tenta novamente." });
      }
    });
  }

  return (
    <FormSection
      title="Eliminar conta"
      description="Elimina a tua conta e os dados associados. Esta ação não pode ser desfeita."
    >
      <div className="flex max-w-xl flex-col gap-4">
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>A tua conta, os teus dados pessoais e as sessões são apagados.</li>
          <li>Os teus pedidos de suporte são apagados.</li>
          <li>
            Os registos de encomendas que temos de conservar por obrigação legal ficam guardados,
            sem ligação à tua conta.
          </li>
        </ul>

        {open ? (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <TextField
              label="Palavra-passe (para confirmar)"
              name="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldError(undefined);
              }}
              error={fieldError}
            />
            {result && !result.ok && !fieldError ? (
              <p role="alert" className="text-sm text-foreground">
                {result.error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "A eliminar…" : "Eliminar a minha conta"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  setPassword("");
                  setResult(null);
                  setFieldError(undefined);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
              Eliminar conta…
            </Button>
          </div>
        )}
      </div>
    </FormSection>
  );
}
