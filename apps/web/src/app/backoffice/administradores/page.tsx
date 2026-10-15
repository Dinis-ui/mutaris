import type { Metadata } from "next";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { AdminCreateForm } from "@/components/backoffice/admin-create-form";
import { AdminRowActions } from "@/components/backoffice/admin-row-actions";
import { listAdmins } from "@/lib/backoffice-admin-accounts";
import { ADMIN_ROLE_LABELS } from "@/lib/admin-permissions";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Administradores",
};

export default async function BackofficeAdminsPage() {
  const admins = await listAdmins();

  return (
    <>
      <BackofficePageHeader
        title="Administradores"
        description="Contas com acesso ao backoffice e o respetivo perfil de permissões. Desativar ou repor a palavra-passe termina as sessões dessa conta."
      />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-foreground">
                    {admin.name}
                    {admin.isSelf ? (
                      <span className="text-muted-foreground"> (tu)</span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Criado em {formatDate(admin.createdAt)}
                  </p>
                  <div>
                    <Badge variant={admin.disabled ? "outline" : "solid"}>
                      {admin.disabled ? "Desativado" : "Ativo"}
                    </Badge>{" "}
                    <Badge variant="outline">
                      Perfil: {ADMIN_ROLE_LABELS[admin.role]}
                    </Badge>
                  </div>
                </div>
                {admin.isSelf ? (
                  <a
                    href="/backoffice/conta"
                    className="text-sm font-medium underline underline-offset-4"
                  >
                    Alterar a minha palavra-passe
                  </a>
                ) : (
                  <AdminRowActions
                    id={admin.id}
                    name={admin.name}
                    disabled={admin.disabled}
                    role={admin.role}
                  />
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Novo administrador</h2>
        <AdminCreateForm />
      </section>
    </>
  );
}
