import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/cn";
import { getPlatformStatus } from "@/lib/backoffice";
import type { PlatformStatusTone } from "@/data/backoffice-dashboard";

const dotClasses: Record<PlatformStatusTone, string> = {
  positive: "bg-primary",
  attention: "bg-foreground",
  neutral: "bg-paper-dim",
};

const labelByTone: Record<PlatformStatusTone, string> = {
  positive: "Operacional",
  attention: "Por implementar",
  neutral: "Sem dados reais",
};

export function BackofficePlatformStatus() {
  const status = getPlatformStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado da plataforma</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="flex flex-col gap-4">
          {status.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[item.tone])}
                />
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Badge className="whitespace-nowrap">{labelByTone[item.tone]}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}