"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { PasswordStrength } from "@/components/account/password-strength";
import { TextField } from "@/components/account/fields";
import {
  ADMIN_ROLES,
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/lib/admin-permissions";
import {
  createAdminAction,
  type AdminActionResult,
} from "@/app/backoffice/administradores/actions";

export function AdminCreateForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>("read");
  const [result, setResult] = React.useState<AdminActionResult | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      try {
        const response = await createAdminAction({ name, email, password, role });
        setResult(response);
        if (response.ok) {
          setName("");
          setEmail("");
          setPassword("");
          setRole("read");
        }
      } catch {
        setResult({
          ok: false,
          error: "Não foi possível criar a conta. Tenta novamente.",
        });
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
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Perfil</legend>
        {ADMIN_ROLES.map((option) => (
          <label key={option} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              name="admin-role"
              value={option}
              checked={role === option}
              onChange={() => setRole(option)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-foreground">
                {ADMIN_ROLE_LABELS[option]}
              </span>
              <span className="text-muted-foreground">
                {" "}
                — {ADMIN_ROLE_DESCRIPTIONS[option]}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
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
