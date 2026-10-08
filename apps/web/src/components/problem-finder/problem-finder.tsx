"use client";

import * as React from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { SolutionCard } from "@/components/solutions/solution-card";
import { matchProblem, type ProblemMatch } from "@/lib/problem-finder";

const EXAMPLES = [
  "Moradia com dois pisos e um cão",
  "Loja com horário noturno",
  "Já tive uma fuga de água em casa",
];

export function ProblemFinder() {
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = React.useState<ProblemMatch | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim() || status === "loading") return;

    setStatus("loading");
    setResult(null);

    timeoutRef.current = setTimeout(() => {
      setResult(matchProblem(description));
      setStatus("done");
    }, 700);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="problem-description" className="sr-only">
          Descreve o teu problema
        </label>
        <Textarea
          id="problem-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={"Tenho uma moradia com dois pisos, um cão\ne quero protegê-la quando estou fora."}
          rows={4}
          className="text-lg"
        />

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setDescription(example)}
              className="rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>

        <div>
          <Button
            type="submit"
            size="lg"
            className="w-full uppercase sm:w-auto"
            disabled={!description.trim() || status === "loading"}
          >
            {status === "loading" ? (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal aria-hidden="true" className="h-4 w-4" />
            )}
            Encontrar solução
          </Button>
        </div>
      </form>

      <div aria-live="polite" className="min-h-[1px]">
        {status === "loading" ? (
          <p className="text-sm text-muted-foreground">A analisar a tua descrição…</p>
        ) : null}

        {status === "done" && result ? (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              Com base no que descreveste, isto parece-se com uma necessidade de{" "}
              <span className="font-semibold text-foreground">{result.category.name}</span>.
              Recomendamos:
            </p>
            <div className="max-w-sm">
              <SolutionCard solution={result.solution} category={result.category} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
