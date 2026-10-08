import type { Metadata } from "next";
import { Container } from "@workspace/ui/components/container";
import { BackofficeSidebar } from "@/components/backoffice/sidebar";

export const metadata: Metadata = {
  title: {
    default: "Backoffice",
    template: "%s · Backoffice",
  },
  robots: { index: false, follow: false },
};

/**
 * Shell de administração. Não tem o Header/Footer do site público — ver
 * `components/layout/site-chrome.tsx`, que esconde ambos para qualquer
 * rota dentro de `/backoffice`.
 *
 * Importante: esta área ainda não tem autenticação nem controlo de
 * acessos. Qualquer pessoa com o URL consegue abrir `/backoffice`. Isto
 * tem de ser resolvido antes de este backoffice ir para produção.
 */
export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="grid grid-cols-1 gap-8 py-10 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-10 lg:self-start">
        <BackofficeSidebar />
      </aside>
      <div className="flex min-w-0 flex-col gap-10">{children}</div>
    </Container>
  );
}