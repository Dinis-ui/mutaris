"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { PendingNotice } from "@/components/account/pending-notice";
import { SelectField, TextField, TextareaField } from "@/components/account/fields";
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
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawCategory = String(data.get("category") ?? "");

    const input: SupportRequestInput = {
      category: isSupportCategory(rawCategory) ? rawCategory : "other",
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const found = validateSupportRequest(input);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setSubmitted(false);
      return;
    }

    // Frontend only: there is no ticket system or email service yet, so nothing is sent.
    // TODO (integração futura): enviar `input` ao sistema de pedidos de suporte.
    setSubmitted(true);
  }

  return (
    <FormSection
      title="Pedir ajuda"
      description="Conta-nos o que se passa e respondemos o mais rapidamente possível."
    >
      <form
        onSubmit={onSubmit}
        onChange={() => setSubmitted(false)}
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
        {submitted ? (
          <PendingNotice>
            O envio de pedidos ainda não está ativo. Entretanto, podes falar connosco através da
            página de{" "}
            <Link href="/contactos" className="font-medium text-foreground underline underline-offset-4">
              contactos
            </Link>
            .
          </PendingNotice>
        ) : null}
        <div>
          <Button type="submit">Enviar pedido</Button>
        </div>
      </form>
    </FormSection>
  );
}
