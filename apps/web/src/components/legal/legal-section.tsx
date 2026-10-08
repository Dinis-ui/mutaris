import * as React from "react";

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

/** Shared heading + body treatment for legal pages (privacy, terms, ...). */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
