import Link from "next/link";
import { mainNav } from "@/config/navigation";

export function DesktopNav() {
  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul className="flex items-center gap-8">
        {mainNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
