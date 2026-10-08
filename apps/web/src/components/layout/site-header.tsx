import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { Logo } from "@/components/layout/logo";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-1">
            <Link
              href="/#encontrar-solucao"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Encontrar a minha solução"
            >
              <Search aria-hidden="true" className="h-5 w-5" />
            </Link>
            <UserMenu />
            <Link
              href="/carrinho"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
              aria-label="Carrinho"
            >
              <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            </Link>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
