import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeSupportTable } from "@/components/backoffice/support-table";
import { getSupportTickets } from "@/lib/backoffice";

export const metadata: Metadata = {
  title: "Suporte",
};

export default function BackofficeSupportPage() {
  const tickets = getSupportTickets();

  return (
    <>
      <BackofficePageHeader
        title="Suporte"
        description="Pedidos de suporte dos clientes — os marcados como “Demo” são dados de demonstração, não pedidos reais."
      />
      <BackofficeSupportTable tickets={tickets} />
    </>
  );
}
