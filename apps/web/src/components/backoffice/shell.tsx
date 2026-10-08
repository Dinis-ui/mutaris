"use client";

import { usePathname } from "next/navigation";
import { Container } from "@workspace/ui/components/container";
import { BackofficeSidebar } from "@/components/backoffice/sidebar";

/**
 * A página de login (`/backoffice/login`) não deve ter a sidebar de
 * administração — só faz sentido depois de autenticado. Tal como o
 * `SiteChrome` do site público, decide isto pelo `pathname`.
 */
export function BackofficeShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName?: string;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/backoffice/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <Container className="grid grid-cols-1 gap-8 py-10 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-10 lg:self-start">
        <BackofficeSidebar adminName={adminName} />
      </aside>
      <div className="flex min-w-0 flex-col gap-10">{children}</div>
    </Container>
  );
}
