"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { PasswordStrength } from "@/components/account/password-strength";
import { TextField } from "@/components/account/fields";
import { changePasswordAction, type ActionResult } from "@/app/conta/actions";
import { validatePasswordChange, type PasswordChangeErrors } from "@/lib/password";

const fieldNames = {
  current: "current-password",
  next: "new-password",
  confirm: "confirm-password",
} as const;

export function PasswordForm() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<PasswordChangeErrors>({});
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function update(field: keyof PasswordChangeErrors, setValue: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      setResult(null);
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    };
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validatePasswordChange({ current, next, confirm });
    setErrors(found);

    const firstInvalid = (["current", "next", "confirm"] as const).find((key) => found[key]);
    if (firstInvalid) {
      setResult(null);
      const input = event.currentTarget.elements.namedItem(fieldNames[firstInvalid]);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    startTransition(async () => {
      try {
        const response = await changePasswordAction({ current, next, confirm });
        setResult(response);
        if (response.ok) {
          setCurrent("");
          setNext("");
          setConfirm("");
          setErrors({});
        } else if (response.fields) {
          setErrors(response.fields as PasswordChangeErrors);
        }
      } catch {
        setResult({ ok: false, error: "Não foi possível alterar a palavra-passe. Tenta novamente." });
      }
    });
  }

  const confirmHint =
    confirm.length === 0
      ? undefined
      : confirm === next
        ? "As palavras-passe coincidem."
        : "As palavras-passe ainda não coincidem.";

  return (
    <FormSection
      title="Alterar palavra-passe"
      description="Escolhe uma palavra-passe forte, que não uses noutros serviços."
    >
      <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-5">
        <TextField
          label="Palavra-passe atual"
          name={fieldNames.current}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={update("current", setCurrent)}
          error={errors.current}
        />
        <TextField
          label="Nova palavra-passe"
          name={fieldNames.next}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={update("next", setNext)}
          error={errors.next}
        />
        <PasswordStrength value={next} />
        <TextField
          label="Confirmar nova palavra-passe"
          name={fieldNames.confirm}
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={update("confirm", setConfirm)}
          hint={confirmHint}
          error={errors.confirm}
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
    </FormSection>
  );
}
