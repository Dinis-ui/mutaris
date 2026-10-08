"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { mainNav, footerNav, accountMenuNav } from "@/config/navigation";
import { Button } from "@workspace/ui/components/button";

export function MobileNav() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm md:hidden" />
        <Dialog.Content
          className="fixed inset-x-0 top-0 z-50 flex max-h-[85dvh] flex-col overflow-y-auto rounded-b-2xl border-b border-border bg-card p-6 shadow-[var(--shadow-soft)] md:hidden"
          aria-label="Menu de navegação"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-sm font-medium text-muted-foreground">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar menu">
                <X aria-hidden="true" className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>

          <nav aria-label="Navegação principal" className="mt-6">
            <ul className="flex flex-col gap-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-lg font-medium text-foreground hover:bg-ink-3"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 flex flex-col gap-1 border-t border-border pt-6">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              A minha conta
            </p>
            {accountMenuNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-ink-3 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                // Frontend only: no real session yet.
                router.push("/");
              }}
              className="block rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-ink-3 hover:text-foreground"
            >
              Terminar sessão
            </button>
            <Link
              href="/carrinho"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-ink-3 hover:text-foreground"
            >
              Carrinho
            </Link>
          </div>

          <nav aria-label="Ligações adicionais" className="mt-2">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2">
              {footerNav.slice(2).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
