import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Boxes } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { AccountPageHeader } from "@/components/account/page-header";
import { EmptyState } from "@/components/account/empty-state";
import { StatusBadge, type StatusTone } from "@/components/account/status-badge";
import { ownedSolutions } from "@/data/account";
import { solutionStatusLabel } from "@/lib/account";
import type { OwnedSolutionStatus } from "@workspace/types";

export const metadata: Metadata = { title: "As minhas soluções" };

const statusTone: Record<OwnedSolutionStatus, StatusTone> = {
  active: "positive",
  "setup-pending": "neutral",
  "needs-attention": "attention",
};

export default function SolutionsPage() {
  return (
    <>
      <AccountPageHeader
        title="As minhas soluções"
        description="Os equipamentos, guias e manuais das soluções que adquiriste."
      />
      {ownedSolutions.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {ownedSolutions.map((solution) => (
            <li key={solution.id}>
              <Card className="flex h-full flex-col">
                <CardHeader className="flex-row items-start justify-between gap-4">
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    <span className="text-muted-foreground">MUTARIS </span>
                    {solution.name}
                  </p>
                  <StatusBadge
                    label={solutionStatusLabel[solution.status]}
                    tone={statusTone[solution.status]}
                  />
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-6">
                  <div>
                    <h2 className="text-sm font-medium text-foreground">Equipamentos associados</h2>
                    {solution.equipment.length > 0 ? (
                      <ul className="mt-3 flex flex-col gap-2">
                        {solution.equipment.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 text-sm text-muted-foreground"
                          >
                            <span>{item.name}</span>
                            <span>× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Ainda não há equipamentos associados a esta solução.
                      </p>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-foreground">Guias e manuais</h2>
                    {solution.guides.length > 0 ? (
                      <ul className="mt-3 flex flex-col gap-2">
                        {solution.guides.map((guide) => (
                          <li key={guide.id}>
                            <Link
                              href={guide.href}
                              className="inline-flex items-center gap-2 rounded-md text-sm text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <BookOpen aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                              {guide.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Os guias desta solução ficam disponíveis aqui.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Boxes}
          title="Ainda não tens soluções"
          description="Depois de adquirires uma solução, vais encontrar aqui os equipamentos que a compõem, os guias de instalação e os manuais."
          actions={
            <>
              <Button asChild>
                <Link href="/#encontrar-solucao">
                  Encontrar a minha solução
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/solucoes">Ver soluções</Link>
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
