import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/cn";

export type StatusTone = "neutral" | "positive" | "attention" | "muted";

const toneClasses: Record<StatusTone, string> = {
  neutral: "text-foreground",
  positive: "border-primary/40 text-primary",
  attention: "border-line-strong text-foreground",
  muted: "text-muted-foreground",
};

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-paper-dim",
  positive: "bg-primary",
  attention: "bg-foreground",
  muted: "bg-paper-faint",
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: StatusTone }) {
  return (
    <Badge className={cn("whitespace-nowrap", toneClasses[tone])}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />
      {label}
    </Badge>
  );
}
