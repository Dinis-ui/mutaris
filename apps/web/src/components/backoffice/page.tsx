import type { Metadata } from "next";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { BackofficeSummaryCards } from "@/components/backoffice/summary-cards";
import { BackofficeRecentActivity } from "@/components/backoffice/recent-activity";
import { BackofficePlatformStatus } from "@/components/backoffice/platform-status";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function BackofficeDashboardPage() {
  return (
    <>
      <BackofficePageHeader
        title="Dashboard"
        description="Visão geral da plataforma MUTARIS. Os valores abaixo são dados de demonstração."
      />
      <BackofficeSummaryCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BackofficeRecentActivity />
        <BackofficePlatformStatus />
      </div>
    </>
  );
}