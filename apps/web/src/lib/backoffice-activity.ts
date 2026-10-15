import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { auditLog } from "@/db/schema";
import { requireAdmin } from "@/lib/backoffice-session-server";
import { ACTIVITY_ACTIONS } from "@/lib/audit-actions";
import type { ActivityTone } from "@/data/backoffice-dashboard";

/** Histórico completo do registo de atividade, com filtros e paginação (só servidor). */

export const ACTIVITY_PAGE_SIZE = 25;

export interface ActivityFilters {
  action?: string;
  query?: string;
  page: number;
}

export interface ActivityRow {
  id: string;
  title: string;
  tone: ActivityTone;
  target: string;
  actorName: string;
  createdAt: string;
}

export interface ActivityPage {
  rows: ActivityRow[];
  total: number;
  page: number;
  pageCount: number;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function getActivityPage(filters: ActivityFilters): Promise<ActivityPage> {
  await requireAdmin();

  const conditions: SQL[] = [];
  if (filters.action && filters.action in ACTIVITY_ACTIONS) {
    conditions.push(eq(auditLog.action, filters.action));
  }
  const query = filters.query?.trim().slice(0, 100);
  if (query) {
    const pattern = `%${escapeLike(query)}%`;
    const match = or(ilike(auditLog.target, pattern), ilike(auditLog.actorName, pattern));
    if (match) conditions.push(match);
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const db = getDb();
  const [totalRow] = await db.select({ value: count() }).from(auditLog).where(where);
  const total = totalRow?.value ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pageCount);

  const rows = await db
    .select()
    .from(auditLog)
    .where(where)
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .limit(ACTIVITY_PAGE_SIZE)
    .offset((page - 1) * ACTIVITY_PAGE_SIZE);

  return {
    total,
    page,
    pageCount,
    rows: rows.map((row) => {
      const meta = ACTIVITY_ACTIONS[row.action];
      return {
        id: row.id,
        title: meta?.title ?? "Ação registada",
        tone: meta?.tone ?? "neutral",
        target: row.target,
        actorName: row.actorName,
        createdAt: row.createdAt.toISOString(),
      };
    }),
  };
}
