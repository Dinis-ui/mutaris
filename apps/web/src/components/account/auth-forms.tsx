"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { TextField } from "@/components/account/fields";
import { PasswordStrength } from "@/components/account/password-strength";
import {
  normalizeEmail,
  validateRegistration,
  type RegistrationErrors,
} from "@/lib/customer-auth";

async function postJson(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, data: data as { error?: string; fields?: RegistrationErrors } | null };
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/conta-entrar", { email, password });
      if (!ok) {
        setError(data?.error ?? "Não foi possível iniciar sessão.");
        return;
      }
      router.push("/conta");
      router.refresh();
    } catch {
      setError("Não foi possível ligar ao servidor. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoFocus
        required
      />
      <TextField
        label="Palavra-passe"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "A entrar…" : "Entrar"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link href="/registar" className="font-medium text-foreground underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<RegistrationErrors>({});
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const found = validateRegistration({ name, email: normalizeEmail(email), password, acceptTerms });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/conta-registar", {
        name,
        email,
        password,
        acceptTerms,
      });
      if (!ok) {
        setError(data?.error ?? "Não foi possível criar a conta.");
        return;
      }
      router.push("/conta");
      router.refresh();
    } catch {
      setError("Não foi possível ligar ao servidor. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-5">
      <TextField
        label="Nome"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        autoFocus
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <TextField
        label="Palavra-passe"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />
      <PasswordStrength value={password} />

      <div className="flex flex-col gap-2">
        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            aria-invalid={errors.acceptTerms ? true : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" className="font-medium underline underline-offset-4">
              Termos
            </Link>{" "}
            e a{" "}
            <Link href="/privacidade" className="font-medium underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms ? (
          <p role="alert" className="text-sm text-foreground">
            {errors.acceptTerms}
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "A criar conta…" : "Criar conta"}
      </Button>
      <p className="text-sm text-muted-foreground">
        Ainda não verificamos o email: a conta fica ativa logo após o registo. Já tens conta?{" "}
        <Link href="/entrar" className="font-medium text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
