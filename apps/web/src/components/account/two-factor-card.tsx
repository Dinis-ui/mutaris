import { MessageSquare, Smartphone } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { FormSection } from "@/components/account/form-section";

const methods = [
  {
    id: "app",
    title: "Aplicação de autenticação",
    description: "Gera códigos temporários no teu telemóvel.",
    icon: Smartphone,
  },
  {
    id: "sms",
    title: "Mensagem de texto (SMS)",
    description: "Recebe um código no teu número de telemóvel.",
    icon: MessageSquare,
  },
];

/**
 * Visual placeholder for two-factor authentication. Nothing here can be turned
 * on yet: the actions are disabled until there is a real authentication service.
 */
export function TwoFactorCard() {
  return (
    <FormSection
      title="Autenticação de dois fatores"
      description="Uma camada extra de proteção: além da palavra-passe, será pedido um código ao iniciares sessão."
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Estado</span>
          <Badge>Ainda não disponível</Badge>
        </div>

        <ul className="flex flex-col gap-3">
          {methods.map((method) => (
            <li
              key={method.id}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4"
            >
              <IconBadge size="sm">
                <method.icon aria-hidden="true" />
              </IconBadge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{method.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{method.description}</p>
              </div>
              <Button type="button" variant="secondary" size="sm" disabled>
                Configurar
              </Button>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground">
          A autenticação de dois fatores ainda não está disponível. Assim que estiver, poderás
          escolher aqui o método que preferes.
        </p>
      </div>
    </FormSection>
  );
}
