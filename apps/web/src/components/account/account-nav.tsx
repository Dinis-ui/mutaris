"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { accountNav } from "@/config/navigation";
import { iconRegistry } from "@/lib/icons";
import { cn } from "@workspace/ui/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/conta" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar on large screens, horizontally scrollable pills on small ones. */
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação da conta" className="-mx-5 sm:-mx-8 lg:mx-0">
      <ul className="flex gap-2 overflow-x-auto px-5 pb-1 sm:px-8 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {accountNav.map((item) => {
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
                <Icon
                  aria-hidden="true"
                  className={cn("h-4 w-4", active && "text-primary")}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
