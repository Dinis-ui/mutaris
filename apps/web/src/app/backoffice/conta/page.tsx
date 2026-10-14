import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { AdminOwnPasswordForm } from "@/components/backoffice/admin-own-password-form";
import { requireAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: "A minha conta",
};

export default async function BackofficeAccountPage() {
  const admin = await requireAdmin();

  return (
    <>
      <BackofficePageHeader
        title="A minha conta"
        description={`Sessão iniciada como ${admin.name} (${admin.email}). Ao alterar a palavra-passe, as tuas outras sessões terminam.`}
      />
      <AdminOwnPasswordForm />
    </>
  );
}
