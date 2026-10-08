"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { backofficeNav } from "@/config/navigation";
import { iconRegistry } from "@/lib/icons";
import { Logo } from "@/components/layout/logo";
import { cn } from "@workspace/ui/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/backoffice"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Sidebar de administração. Segue o mesmo padrão responsivo do
 * `AccountNav` da área de cliente: pills horizontais em mobile, lista
 * vertical fixa em desktop.
 */
export function BackofficeSidebar({ adminName }: { adminName?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/backoffice-logout", { method: "POST" });
      router.push("/backoffice/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden lg:flex lg:flex-col lg:gap-1">
        <Logo />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Backoffice
        </p>
      </div>

      <nav aria-label="Navegação do backoffice" className="-mx-5 sm:-mx-8 lg:mx-0">
        <ul className="flex gap-2 overflow-x-auto px-5 pb-1 sm:px-8 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {backofficeNav.map((item) => {
            const Icon = iconRegistry[item.icon];
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center gap-2.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex lg:w-full lg:rounded-lg lg:border-transparent",
                    active
                      ? "border-line-strong bg-card text-foreground"
                      : "border-border text-muted-foreground hover:bg-card hover:text-foreground lg:border-transparent",
                  )}
                >
                  <Icon aria-hidden="true" className={cn("h-4 w-4", active && "text-primary")} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex flex-col gap-3">
        {adminName ? (
          <p className="text-xs text-muted-foreground">
            Sessão iniciada como <span className="font-medium text-foreground">{adminName}</span>
          </p>
        ) : null}
        <Link
          href="/"
          className="hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:flex"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar ao site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" />
          {loggingOut ? "A terminar sessão…" : "Terminar sessão"}
        </button>
      </div>
    </div>
  );
}
