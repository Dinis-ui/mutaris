import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPageHeader } from "@/components/account/page-header";
import { Container } from "@workspace/ui/components/container";
import { RegisterForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/customer-session-server";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/conta");

  return (
    <Container className="flex justify-center py-14 md:py-20">
      <div className="flex w-full max-w-md flex-col gap-8">
        <AccountPageHeader
          title="Criar conta"
          description="Com uma conta podes acompanhar as tuas encomendas e falar com o suporte."
        />
        <RegisterForm />
      </div>
    </Container>
  );
}
