"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

export function BackofficeLoginForm() {
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
      const res = await fetch("/api/backoffice-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Não foi possível iniciar sessão.");
        return;
      }
      router.push("/backoffice");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="backoffice-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="backoffice-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="backoffice-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="backoffice-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={loading} className="uppercase">
        {loading ? "A entrar…" : "Entrar"}
      </Button>
    </form>
  );
}
