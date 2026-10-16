import type { Metadata } from "next";
import Link from "next/link";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { getMigrationStatus } from "@/lib/migration-status";

export const metadata: Metadata = {
  title: "Indisponível",
};

// Depende do estado da base de dados no momento: nunca em cache.
export const dynamic = "force-dynamic";

/**
 * Mostrada quando o backoffice não consegue consultar a base de dados.
 * Não exige sessão (não pode: é precisamente a sessão que falhou) e por isso
 * só dá uma indicação geral, sem dados.
 */
export default async function BackofficeUnavailablePage() {
  const migrations = await getMigrationStatus();
  const outdated = migrations.state === "pending";

  return (
    <>
      <BackofficePageHeader
        title="Backoffice indisponível"
        description={
          outdated
            ? "A base de dados parece estar desatualizada: há migrações por aplicar. Quem gere o site tem de correr 'npm run db:migrate' contra esta base de dados."
            : "Não foi possível consultar a base de dados. Tenta novamente dentro de instantes; se continuar, vê os registos (Logs) da Vercel."
        }
      />
      <Link href="/backoffice" className="text-sm font-medium underline underline-offset-4">
        Tentar novamente
      </Link>
    </>
  );
}
