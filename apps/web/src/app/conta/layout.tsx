import type { Metadata } from "next";
import { Container } from "@workspace/ui/components/container";
import { AccountNav } from "@/components/account/account-nav";

export const metadata: Metadata = {
  title: "A minha conta",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="grid grid-cols-1 gap-8 py-10 md:py-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <AccountNav />
      </aside>
      <div className="flex min-w-0 flex-col gap-10">{children}</div>
    </Container>
  );
}
