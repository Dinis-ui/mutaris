import * as React from "react";
import { cn } from "../lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline";
}

function Badge({ variant = "outline", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variant === "solid"
          ? "bg-primary text-primary-foreground"
          : "border border-line-strong text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
