import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeUsersTable } from "@/components/backoffice/users-table";
import { getUsers } from "@/lib/backoffice";

export const metadata: Metadata = {
  title: "Utilizadores",
};

export default function BackofficeUsersPage() {
  const users = getUsers();

  return (
    <>
      <BackofficePageHeader
        title="Utilizadores"
        description="Contas de cliente — as marcadas como “Demo” são dados de demonstração, não contas reais."
      />
      <BackofficeUsersTable users={users} />
    </>
  );
}
