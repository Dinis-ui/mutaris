import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "@workspace/ui/components/icon-badge";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-line-strong bg-card px-6 py-12 text-center md:py-16">
      <IconBadge size="lg">
        <Icon aria-hidden="true" />
      </IconBadge>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
      ) : null}
    </div>
  );
}
