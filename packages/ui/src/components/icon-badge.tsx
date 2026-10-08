import * as React from "react";
import { cn } from "../lib/cn";

export interface IconBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<IconBadgeProps["size"]>, string> = {
  sm: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
  md: "h-12 w-12 [&_svg]:h-5 [&_svg]:w-5",
  lg: "h-14 w-14 [&_svg]:h-6 [&_svg]:w-6",
};

function IconBadge({ size = "md", className, children, ...props }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-ink-3 text-foreground",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { IconBadge };
