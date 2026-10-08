import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { getRecentActivity } from "@/lib/backoffice";
import type { ActivityTone } from "@/data/backoffice-dashboard";

const dotClasses: Record<ActivityTone, string> = {
  neutral: "bg-paper-dim",
  positive: "bg-primary",
  attention: "bg-foreground",
};

export function BackofficeRecentActivity() {
  const activity = getRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="flex flex-col gap-5">
          {activity.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span
                aria-hidden="true"
                className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[item.tone])}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}