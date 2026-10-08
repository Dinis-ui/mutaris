import type { Metadata } from "next";
import { Monitor } from "lucide-react";
import { AccountPageHeader } from "@/components/account/page-header";
import { FormSection } from "@/components/account/form-section";
import { PasswordForm } from "@/components/account/password-form";
import { TwoFactorCard } from "@/components/account/two-factor-card";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { StatusBadge } from "@/components/account/status-badge";
import { sessionDevices } from "@/data/account";

export const metadata: Metadata = { title: "Segurança" };

export default function SecurityPage() {
  return (
    <>
      <AccountPageHeader
        title="Segurança"
        description="Protege a tua conta com uma palavra-passe forte e controla onde tens sessão iniciada."
      />

      <PasswordForm />

      <TwoFactorCard />

      <FormSection
        title="Sessões e dispositivos"
        description="Os dispositivos onde a tua conta está com sessão iniciada."
      >
        <ul className="flex flex-col gap-3">
          {sessionDevices.map((device) => (
            <li
              key={device.id}
              className="flex items-center gap-4 rounded-lg border border-border p-4"
            >
              <IconBadge size="sm">
                <Monitor aria-hidden="true" />
              </IconBadge>
              <p className="flex-1 text-sm font-medium text-foreground">{device.label}</p>
              {device.current ? <StatusBadge label="Sessão atual" tone="positive" /> : null}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Não existem outras sessões iniciadas na tua conta.
        </p>
      </FormSection>
    </>
  );
}
