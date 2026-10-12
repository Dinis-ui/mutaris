import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { ProductForm } from "@/components/backoffice/product-form";
import { getProductForAdmin } from "@/lib/backoffice-products";

export const metadata: Metadata = {
  title: "Editar produto",
};

export default async function BackofficeEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductForAdmin(id);
  if (!product) notFound();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/backoffice/loja">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Loja
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/loja/${product.slug}`} target="_blank">
              Ver na loja
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <BackofficePageHeader title={product.name} description="Editar produto" />
        {product.isDemo ? (
          <div>
            <Badge variant="outline">Demo</Badge>
          </div>
        ) : null}
      </div>
      <ProductForm product={product} />
    </>
  );
}
