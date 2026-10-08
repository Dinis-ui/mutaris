import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@workspace/ui/components/card";
import { IconBadge } from "@workspace/ui/components/icon-badge";

/**
 * Placeholder honesto para as secções do backoffice que ainda não têm
 * funcionalidade própria — evita que os links da sidebar fiquem a dar 404.
 */
export function BackofficeComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <IconBadge size="lg">
          <Icon aria-hidden="true" />
        </IconBadge>
        <div className="flex max-w-md flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}