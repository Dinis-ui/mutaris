"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { PasswordStrength } from "@/components/account/password-strength";
import { PendingNotice } from "@/components/account/pending-notice";
import { TextField } from "@/components/account/fields";
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
  const [submitted, setSubmitted] = React.useState(false);

  function update(field: keyof PasswordChangeErrors, setValue: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
      setSubmitted(false);
      setErrors((previous) => ({ ...previous, [field]: undefined }));
    };
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validatePasswordChange({ current, next, confirm });
    setErrors(found);

    const firstInvalid = (["current", "next", "confirm"] as const).find((key) => found[key]);
    if (firstInvalid) {
      setSubmitted(false);
      const input = event.currentTarget.elements.namedItem(fieldNames[firstInvalid]);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    // Frontend only: there is no authentication service yet, so nothing is sent.
    // TODO (integração futura): enviar a alteração de palavra-passe ao serviço de autenticação.
    setSubmitted(true);
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
        {submitted ? (
          <PendingNotice>
            Ainda não é possível alterar a palavra-passe. Vamos avisar-te assim que esta opção
            estiver disponível.
          </PendingNotice>
        ) : null}
        <div>
          <Button type="submit">Alterar palavra-passe</Button>
        </div>
      </form>
    </FormSection>
  );
}
