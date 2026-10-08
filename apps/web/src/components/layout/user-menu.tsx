"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { accountMenuNav } from "@/config/navigation";
import { iconRegistry } from "@/lib/icons";
import { cn } from "@workspace/ui/lib/cn";

const itemClasses =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-ink-3 focus-visible:bg-ink-3 focus-visible:outline-none";

export function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const LogOutIcon = iconRegistry["log-out"];

  const items = React.useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
    [],
  );

  // Move focus into the menu when it opens.
  React.useEffect(() => {
    if (open) items()[0]?.focus();
  }, [open, items]);

  // Close on outside pointer press.
  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close(returnFocus = false) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) return;
    const list = items();
    const index = list.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "ArrowDown":
        event.preventDefault();
        list[(index + 1) % list.length]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        list[(index - 1 + list.length) % list.length]?.focus();
        break;
      case "Home":
        event.preventDefault();
        list[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        list[list.length - 1]?.focus();
        break;
    }
  }

  function onBlur(event: React.FocusEvent) {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  function signOut() {
    close();
    // Frontend only: there is no session to end yet, so just return to the home page.
    router.push("/");
  }

  return (
    <div ref={rootRef} className="relative hidden sm:block" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Conta"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-card",
        )}
      >
        <User aria-hidden="true" className="h-5 w-5" />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Menu da conta"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-[var(--shadow-soft)]"
        >
          {accountMenuNav.map((item) => {
            const Icon = iconRegistry[item.icon];
            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                onClick={() => close()}
                className={itemClasses}
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            );
          })}
          <div role="separator" className="my-2 h-px bg-border" />
          <button type="button" role="menuitem" onClick={signOut} className={itemClasses}>
            <LogOutIcon aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            Terminar sessão
          </button>
        </div>
      ) : null}
    </div>
  );
}
