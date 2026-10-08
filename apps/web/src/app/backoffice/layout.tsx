import type { Metadata } from "next";
import { BackofficeShell } from "@/components/backoffice/shell";
import { getCurrentAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: {
    default: "Backoffice",
    template: "%s · Backoffice",
  },
  robots: { index: false, follow: false },
};

/**
 * O acesso ao `/backoffice` exige uma sessão de administrador (ver
 * `middleware.ts`, `lib/backoffice-auth.ts` e `lib/backoffice-admins.ts`).
 *
 * Não tem o Header/Footer do site público — ver
 * `components/layout/site-chrome.tsx`, que os esconde para qualquer
 * rota dentro de `/backoffice`.
 */
export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  return <BackofficeShell adminName={admin?.name}>{children}</BackofficeShell>;
}
