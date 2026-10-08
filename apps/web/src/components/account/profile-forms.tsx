"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { FormSection } from "@/components/account/form-section";
import { PendingNotice } from "@/components/account/pending-notice";
import { TextField } from "@/components/account/fields";
import type { CustomerProfile } from "@workspace/types";

const notice =
  "Ainda não é possível guardar alterações. Vamos avisar-te assim que esta opção estiver disponível.";

/** Frontend-only: swallows the submit and tells the customer saving isn't active yet. */
function useSubmitNotice() {
  const [submitted, setSubmitted] = React.useState(false);
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return { submitted, onSubmit };
}

export function PersonalDataForm({ profile }: { profile: CustomerProfile }) {
  const { submitted, onSubmit } = useSubmitNotice();

  return (
    <FormSection title="Dados pessoais" description="Estes dados são usados nas tuas encomendas e no contacto connosco.">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Nome completo"
            name="name"
            autoComplete="name"
            defaultValue={profile.fullName}
            className="md:col-span-2"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={profile.email}
          />
          <TextField
            label="Telefone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={profile.phone}
          />
        </div>
        {submitted ? <PendingNotice>{notice}</PendingNotice> : null}
        <div>
          <Button type="submit">Guardar alterações</Button>
        </div>
      </form>
    </FormSection>
  );
}

export function AddressesForm({ profile }: { profile: CustomerProfile }) {
  const { submitted, onSubmit } = useSubmitNotice();

  return (
    <FormSection title="Moradas" description="As moradas onde podes receber as tuas encomendas.">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        {profile.addresses.map((address) => (
          <fieldset
            key={address.id}
            className="grid grid-cols-1 gap-5 rounded-lg border border-border p-5 md:grid-cols-6"
          >
            <legend className="px-2 text-sm font-medium text-foreground">{address.label}</legend>
            <TextField
              label="Morada"
              name={`${address.id}-street`}
              autoComplete="street-address"
              defaultValue={address.street}
              className="md:col-span-6"
            />
            <TextField
              label="Código postal"
              name={`${address.id}-postal-code`}
              autoComplete="postal-code"
              inputMode="numeric"
              defaultValue={address.postalCode}
              className="md:col-span-2"
            />
            <TextField
              label="Localidade"
              name={`${address.id}-city`}
              autoComplete="address-level2"
              defaultValue={address.city}
              className="md:col-span-4"
            />
          </fieldset>
        ))}
        {submitted ? <PendingNotice>{notice}</PendingNotice> : null}
        <div>
          <Button type="submit">Guardar moradas</Button>
        </div>
      </form>
    </FormSection>
  );
}

export function BillingForm({ profile }: { profile: CustomerProfile }) {
  const { submitted, onSubmit } = useSubmitNotice();
  const { billing } = profile;

  return (
    <FormSection
      title="Dados de faturação"
      description="Usados para emitir as faturas das tuas encomendas."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
          <TextField
            label="Nome ou empresa"
            name="billing-name"
            autoComplete="organization"
            defaultValue={billing.name}
            className="md:col-span-4"
          />
          <TextField
            label="NIF"
            name="billing-tax-id"
            inputMode="numeric"
            defaultValue={billing.taxId}
            className="md:col-span-2"
          />
          <TextField
            label="Morada de faturação"
            name="billing-street"
            autoComplete="street-address"
            defaultValue={billing.street}
            className="md:col-span-6"
          />
          <TextField
            label="Código postal"
            name="billing-postal-code"
            inputMode="numeric"
            defaultValue={billing.postalCode}
            className="md:col-span-2"
          />
          <TextField
            label="Localidade"
            name="billing-city"
            defaultValue={billing.city}
            className="md:col-span-4"
          />
        </div>
        {submitted ? <PendingNotice>{notice}</PendingNotice> : null}
        <div>
          <Button type="submit">Guardar dados de faturação</Button>
        </div>
      </form>
    </FormSection>
  );
}
