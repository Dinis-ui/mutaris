import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { UnusedImagesPanel } from "@/components/backoffice/unused-images-panel";
import { requireAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: "Imagens não usadas",
};

export default async function UnusedImagesPage() {
  await requireAdmin("manage");

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/backoffice/loja">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Loja
          </Link>
        </Button>
        <BackofficePageHeader
          title="Imagens não usadas"
          description="Imagens de produtos que ficaram no armazenamento sem nenhum produto as usar (por exemplo, carregadas num formulário que foi fechado sem guardar). Só se apagam as que têm mais de 24 horas. Apagar não tem volta."
        />
      </div>
      <UnusedImagesPanel />
    </>
  );
}
