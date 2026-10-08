import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { getDashboardSummary } from "@/lib/backoffice";

export function BackofficeSummaryCards() {
  const summary = getDashboardSummary();

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summary.map((item) => (
        <li key={item.id}>
          <Card className="h-full">
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 pt-0">
              <p className="font-accent text-4xl text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}