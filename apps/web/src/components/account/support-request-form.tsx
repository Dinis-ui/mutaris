"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { SelectField, TextField, TextareaField } from "@/components/account/fields";
import { createSupportTicketAction, type ActionResult } from "@/app/conta/actions";
import {
  SUPPORT_MESSAGE_MAX_LENGTH,
  SUPPORT_SUBJECT_MAX_LENGTH,
  isSupportCategory,
  supportCategories,
  validateSupportRequest,
  type SupportRequestErrors,
  type SupportRequestInput,
} from "@/lib/support";

export function SupportRequestForm() {
  const [errors, setErrors] = React.useState<SupportRequestErrors>({});
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawCategory = String(data.get("category") ?? "");

    const input: SupportRequestInput = {
      category: isSupportCategory(rawCategory) ? rawCategory : "other",
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const found = validateSupportRequest(input);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setResult(null);
      return;
    }

    startTransition(async () => {
      try {
        const response = await createSupportTicketAction(input);
        setResult(response);
        if (response.ok) form.reset();
      } catch {
        setResult({ ok: false, error: "Não foi possível enviar o pedido. Tenta novamente." });
      }
    });
  }

  return (
    <FormSection
      title="Pedir ajuda"
      description="Conta-nos o que se passa e respondemos o mais rapidamente possível."
    >
      <form
        onSubmit={onSubmit}
        onChange={() => setResult(null)}
        noValidate
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Tipo de pedido"
            name="category"
            defaultValue={supportCategories[0].value}
          >
            {supportCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Assunto"
            name="subject"
            maxLength={SUPPORT_SUBJECT_MAX_LENGTH}
            error={errors.subject}
          />
        </div>
        <TextareaField
          label="Mensagem"
          name="message"
          rows={5}
          maxLength={SUPPORT_MESSAGE_MAX_LENGTH}
          hint="Quanto mais detalhes, mais rápido conseguimos ajudar."
          error={errors.message}
        />
        {result ? (
          <p role={result.ok ? "status" : "alert"} className="text-sm text-foreground">
            {result.ok ? result.message : result.error}
          </p>
        ) : null}
        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "A enviar…" : "Enviar pedido"}
          </Button>
        </div>
      </form>
    </FormSection>
  );
}
