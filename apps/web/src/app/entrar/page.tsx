import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPageHeader } from "@/components/account/page-header";
import { Container } from "@workspace/ui/components/container";
import { LoginForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/customer-session-server";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/conta");

  return (
    <Container className="flex justify-center py-14 md:py-20">
      <div className="flex w-full max-w-md flex-col gap-8">
        <AccountPageHeader
          title="Entrar"
          description="Acede à tua conta para acompanhar encomendas e pedir ajuda."
        />
        <LoginForm />
      </div>
    </Container>
  );
}
