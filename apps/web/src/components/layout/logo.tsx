import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-md text-lg font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
      {siteConfig.name}
    </Link>
  );
}
