"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  deleteUnusedImagesAction,
  previewUnusedImagesAction,
} from "@/app/backoffice/loja/imagens/actions";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

type View =
  | { kind: "idle" }
  | { kind: "message"; text: string; tone: "ok" | "error" }
  | { kind: "found"; count: number; totalBytes: number; sample: string[] };

/** Dois passos: procurar (não apaga nada) e depois confirmar o apagar. */
export function UnusedImagesPanel() {
  const [view, setView] = React.useState<View>({ kind: "idle" });
  const [confirming, setConfirming] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 5000);
    return () => clearTimeout(timer);
  }, [confirming]);

  function search() {
    setConfirming(false);
    startTransition(async () => {
      try {
        const response = await previewUnusedImagesAction();
        if (!response.ok) return setView({ kind: "message", tone: "error", text: response.error });
        const { preview } = response;
        if (preview.status === "not-configured") {
          return setView({
            kind: "message",
            tone: "error",
            text: "O armazenamento de imagens ainda não está configurado.",
          });
        }
        if (preview.count === 0) {
          return setView({ kind: "message", tone: "ok", text: "Não há imagens por limpar." });
        }
        setView({ kind: "found", count: preview.count, totalBytes: preview.totalBytes, sample: preview.sample });
      } catch {
        setView({ kind: "message", tone: "error", text: "Não foi possível procurar. Tenta novamente." });
      }
    });
  }

  function remove(expectedCount: number) {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    startTransition(async () => {
      try {
        const response = await deleteUnusedImagesAction(expectedCount);
        if (!response.ok) return setView({ kind: "message", tone: "error", text: response.error });
        const { result } = response;
        if (result.status === "changed") {
          return setView({
            kind: "message",
            tone: "error",
            text: "A lista mudou entretanto e não se apagou nada. Procura outra vez.",
          });
        }
        if (result.status === "not-configured") {
          return setView({ kind: "message", tone: "error", text: "O armazenamento de imagens não está configurado." });
        }
        const failedNote = result.failed > 0 ? ` Não foi possível apagar ${result.failed}; tenta de novo mais tarde.` : "";
        setView({
          kind: "message",
          tone: result.failed > 0 ? "error" : "ok",
          text: `Apagadas ${result.deleted} imagens (${formatBytes(result.freedBytes)}).${failedNote}`,
        });
      } catch {
        setView({ kind: "message", tone: "error", text: "Não foi possível apagar. Tenta novamente." });
      }
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div>
        <Button type="button" variant="secondary" onClick={search} disabled={pending}>
          {pending && view.kind !== "found" ? "A procurar…" : "Procurar imagens não usadas"}
        </Button>
      </div>

      {view.kind === "message" ? (
        <p role={view.tone === "error" ? "alert" : "status"} className="text-sm text-foreground">
          {view.text}
        </p>
      ) : null}

      {view.kind === "found" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <p role="status" className="text-sm text-foreground">
            Encontradas <strong>{view.count}</strong> {view.count === 1 ? "imagem" : "imagens"} não
            usadas ({formatBytes(view.totalBytes)}).
          </p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground">
            {view.sample.map((name) => (
              <li key={name}>{name}</li>
            ))}
            {view.count > view.sample.length ? <li>… e mais {view.count - view.sample.length}</li> : null}
          </ul>
          <div>
            <Button
              type="button"
              variant={confirming ? "primary" : "secondary"}
              size="sm"
              disabled={pending}
              onClick={() => remove(view.count)}
            >
              {pending ? "A apagar…" : confirming ? "Confirmar: apagar para sempre" : "Apagar estas imagens"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
