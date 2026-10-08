import * as React from "react";

/** Inline, non-technical message shown when a form has no backend behind it yet. */
export function PendingNotice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-line-strong bg-ink-3 px-4 py-3 text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
