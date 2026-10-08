import Link from "next/link";
import { Container } from "@workspace/ui/components/container";
import { Logo } from "@/components/layout/logo";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <Container className="flex flex-col gap-10 py-14 md:flex-row md:justify-between md:py-16">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">{siteConfig.description}</p>
        </div>

        <nav aria-label="Ligações do rodapé">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-2">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <Container className="border-t border-border py-6">
        <p className="text-xs text-muted-foreground">
          © {year} {siteConfig.name}. Todos os direitos reservados.
        </p>
      </Container>
    </footer>
  );
}
