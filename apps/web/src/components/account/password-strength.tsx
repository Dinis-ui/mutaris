import { Check, Circle } from "lucide-react";
import { getPasswordStrength, passwordRules } from "@/lib/password";
import { cn } from "@workspace/ui/lib/cn";

const SEGMENTS = 4;

const filledClasses: Record<number, string> = {
  1: "bg-paper-faint",
  2: "bg-paper-dim",
  3: "bg-primary",
  4: "bg-primary",
};

/** Strength bar + live checklist of the password requirements. */
export function PasswordStrength({ value }: { value: string }) {
  const strength = getPasswordStrength(value);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-ink-3 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Força da palavra-passe</span>
          <span aria-live="polite" className="font-medium text-foreground">
            {strength.label || "Por definir"}
          </span>
        </div>
        <div aria-hidden="true" className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: SEGMENTS }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 rounded-full bg-line-strong transition-colors",
                index < strength.level && filledClasses[strength.level],
              )}
            />
          ))}
        </div>
      </div>

      <ul aria-label="Requisitos da palavra-passe" className="grid gap-2 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const met = rule.test(value);
          const Icon = met ? Check : Circle;
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-2 text-sm",
                met ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn("h-4 w-4 shrink-0", met && "text-primary")}
              />
              <span>
                {rule.label}
                <span className="sr-only">{met ? " — cumprido" : " — por cumprir"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
