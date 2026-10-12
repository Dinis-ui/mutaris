import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { BackofficeLoginForm } from "@/components/backoffice/login-form";
import { getCurrentAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: "Entrar",
};

export default async function BackofficeLoginPage() {
  // Já tem sessão válida? Vai direto para o dashboard.
  if (await getCurrentAdmin()) redirect("/backoffice");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 px-5 py-16">
      <div className="flex flex-col items-center gap-2">
        <Logo />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Backoffice
        </p>
      </div>
      <BackofficeLoginForm />
    </div>
  );
}
