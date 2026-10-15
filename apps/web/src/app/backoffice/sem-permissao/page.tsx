import type { Metadata } from "next";
import Link from "next/link";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { ADMIN_ROLE_LABELS } from "@/lib/admin-permissions";
import { requireAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: "Sem permissão",
};

export default async function NoPermissionPage() {
  const admin = await requireAdmin();

  return (
    <>
      <BackofficePageHeader
        title="Sem permissão"
        description={`O teu perfil (${ADMIN_ROLE_LABELS[admin.role]}) não permite esta ação ou página. Fala com um administrador com perfil total.`}
      />
      <Link href="/backoffice" className="text-sm font-medium underline underline-offset-4">
        Voltar ao painel
      </Link>
    </>
  );
}
