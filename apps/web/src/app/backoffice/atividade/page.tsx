import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/cn";
import { BackofficePageHeader } from "@/components/backoffice/page-header";
import { getActivityPage } from "@/lib/backoffice-activity";
import { ACTIVITY_ACTIONS } from "@/lib/audit-actions";
import type { ActivityTone } from "@/data/backoffice-dashboard";

export const metadata: Metadata = {
  title: "Atividade",
};

const dotClasses: Record<ActivityTone, string> = {
  neutral: "bg-paper-dim",
  positive: "bg-primary",
  attention: "bg-foreground",
};

const dateTimeFormat = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "Europe/Lisbon",
});

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function buildHref(params: { action: string; q: string; page: number }): string {
  const search = new URLSearchParams();
  if (params.action) search.set("acao", params.action);
  if (params.q) search.set("q", params.q);
  if (params.page > 1) search.set("pagina", String(params.page));
  const text = search.toString();
  return text ? `/backoffice/atividade?${text}` : "/backoffice/atividade";
}

export default async function BackofficeActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const action = first(params.acao);
  const q = first(params.q).slice(0, 100);
  const requestedPage = Number.parseInt(first(params.pagina), 10);

  const result = await getActivityPage({
    action,
    query: q,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });
  const activeAction = action in ACTIVITY_ACTIONS ? action : "";
  const hasFilters = Boolean(activeAction || q);

  return (
    <>
      <BackofficePageHeader
        title="Atividade"
        description="Histórico das ações feitas por administradores no backoffice, da mais recente para a mais antiga."
      />

      <form method="get" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
          Ação
          <select
            name="acao"
            defaultValue={activeAction}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(ACTIVITY_ACTIONS).map(([code, meta]) => (
              <option key={code} value={code}>
                {meta.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-foreground">
          Pesquisar (administrador ou alvo)
          <input
            type="search"
            name="q"
            defaultValue={q}
            maxLength={100}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit">Filtrar</Button>
          {hasFilters ? (
            <Button asChild variant="ghost">
              <Link href="/backoffice/atividade">Limpar</Link>
            </Button>
          ) : null}
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          {result.rows.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              {hasFilters
                ? "Nenhuma atividade corresponde aos filtros."
                : "Ainda não há atividade registada."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {result.rows.map((row) => (
                <li key={row.id} className="flex gap-3 p-5">
                  <span
                    aria-hidden="true"
                    className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[row.tone])}
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{row.title}</p>
                      <time dateTime={row.createdAt} className="text-xs text-muted-foreground">
                        {dateTimeFormat.format(new Date(row.createdAt))}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {row.target ? `${row.target} · por ${row.actorName}` : `Por ${row.actorName}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <nav
        aria-label="Paginação"
        className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground"
      >
        <p>
          {result.total} {result.total === 1 ? "registo" : "registos"} · página {result.page} de{" "}
          {result.pageCount}
        </p>
        <div className="flex gap-2">
          {result.page > 1 ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={buildHref({ action: activeAction, q, page: result.page - 1 })}>
                Anterior
              </Link>
            </Button>
          ) : null}
          {result.page < result.pageCount ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={buildHref({ action: activeAction, q, page: result.page + 1 })}>
                Seguinte
              </Link>
            </Button>
          ) : null}
        </div>
      </nav>
    </>
  );
}
