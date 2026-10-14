"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { PasswordStrength } from "@/components/account/password-strength";
import { TextField } from "@/components/account/fields";
import { createAdminAction, type AdminActionResult } from "@/app/backoffice/administradores/actions";

export function AdminCreateForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [result, setResult] = React.useState<AdminActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      try {
        const response = await createAdminAction({ name, email, password });
        setResult(response);
        if (response.ok) {
          setName("");
          setEmail("");
          setPassword("");
        }
      } catch {
        setResult({ ok: false, error: "Não foi possível criar a conta. Tenta novamente." });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-xl flex-col gap-5">
      <TextField
        label="Nome"
        name="admin-name"
        autoComplete="off"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label="Email"
        name="admin-email"
        type="email"
        autoComplete="off"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <TextField
        label="Palavra-passe inicial"
        name="admin-password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordStrength value={password} />
      {result ? (
        <p role={result.ok ? "status" : "alert"} className="text-sm text-foreground">
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "A criar…" : "Criar administrador"}
        </Button>
      </div>
    </form>
  );
}
