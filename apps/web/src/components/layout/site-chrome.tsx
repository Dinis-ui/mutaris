"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * O backoffice tem o seu próprio "chrome" (sidebar de administração), por
 * isso não deve mostrar o Header/Footer do site público. Este componente é
 * a única peça partilhada que precisou de ser tocada para suportar o
 * `/backoffice` — todas as rotas públicas continuam a renderizar exatamente
 * como antes.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBackoffice = pathname?.startsWith("/backoffice") ?? false;

  return (
    <>
      {isBackoffice ? null : <SiteHeader />}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {isBackoffice ? null : <SiteFooter />}
    </>
  );
}