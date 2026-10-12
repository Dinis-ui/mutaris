import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { ProductForm } from "@/components/backoffice/product-form";
import { requireAdmin } from "@/lib/backoffice-session-server";

export const metadata: Metadata = {
  title: "Novo produto",
};

export default async function BackofficeNewProductPage() {
  await requireAdmin();

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
          title="Novo produto"
          description="O produto aparece na loja pública assim que for criado."
        />
      </div>
      <ProductForm />
    </>
  );
}
