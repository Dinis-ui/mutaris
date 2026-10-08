"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

/**
 * Frontend-only search bar: it never calls anything. Submitting shows an
 * honest notice instead of pretending to return results.
 */
export function SupportSearch() {
  const [value, setValue] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <form onSubmit={onSubmit} className="relative">
        <label htmlFor="support-search" className="sr-only">
          O que precisas de ajuda a resolver?
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="support-search"
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setSubmitted(false);
          }}
          placeholder="O que precisas de ajuda a resolver?"
          className="h-14 rounded-full pl-12 pr-28 text-base md:h-16 md:pl-14 md:text-lg"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 uppercase"
        >
          Pesquisar
        </Button>
      </form>
      {submitted ? (
        <p
          role="status"
          className="rounded-lg border border-line-strong bg-ink-3 px-4 py-3 text-sm text-muted-foreground"
        >
          A pesquisa ainda não está disponível. Explora as categorias abaixo ou fala connosco.
        </p>
      ) : null}
    </div>
  );
}