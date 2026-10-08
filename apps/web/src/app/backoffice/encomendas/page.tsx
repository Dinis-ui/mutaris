import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeOrdersTable } from "@/components/backoffice/orders-table";
import { getOrders } from "@/lib/backoffice";

export const metadata: Metadata = {
  title: "Encomendas",
};

export default function BackofficeOrdersPage() {
  const orders = getOrders();

  return (
    <>
      <BackofficePageHeader
        title="Encomendas"
        description="Encomendas dos clientes — as marcadas como “Demo” são dados de demonstração, não encomendas reais."
      />
      <BackofficeOrdersTable orders={orders} />
    </>
  );
}
