import * as React from "react";
import { cn } from "../lib/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Alternates the background tone to create rhythm between sections. */
  tone?: "base" | "raised";
}

function Section({ tone = "base", className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "py-20 md:py-28",
        tone === "raised" ? "bg-card" : "bg-background",
        className,
      )}
      {...props}
    />
  );
}

export { Section };
