import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { AccountPageHeader } from "@/components/account/page-header";
import { EmptyState } from "@/components/account/empty-state";
import { OrderList } from "@/components/account/order-list";
import { orders } from "@/data/account";

export const metadata: Metadata = { title: "Encomendas" };

export default function OrdersPage() {
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <AccountPageHeader
        title="Encomendas"
        description="Consulta o estado, a data e o valor de cada encomenda."
      />
      {sorted.length > 0 ? (
        <OrderList orders={sorted} />
      ) : (
        <EmptyState
          icon={Package}
          title="Ainda não tens encomendas"
          description="As tuas encomendas vão aparecer aqui assim que fizeres a primeira compra."
          actions={
            <>
              <Button asChild>
                <Link href="/#encontrar-solucao">
                  Encontrar a minha solução
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/loja">Ver a loja</Link>
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
