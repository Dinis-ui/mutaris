/**
 * Utilizadores mockados para o backoffice.
 *
 * Ainda não existem contas reais nem base de dados — estes dados servem só
 * para desenhar a interface de gestão. Nomes e emails são fictícios
 * (`isDemo: true`; os emails usam o domínio reservado `example.com`).
 * Quando houver contas reais, só `lib/backoffice.ts` precisa de mudar.
 */
export type AdminUserStatus = "active" | "pending" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: AdminUserStatus;
  /** ISO 8601 date. */
  createdAt: string;
  isDemo: boolean;
}

export const adminUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Cliente de demonstração 1",
    email: "cliente1@example.com",
    status: "active",
    createdAt: "2026-09-12",
    isDemo: true,
  },
  {
    id: "user-2",
    name: "Cliente de demonstração 2",
    email: "cliente2@example.com",
    status: "active",
    createdAt: "2026-09-20",
    isDemo: true,
  },
  {
    id: "user-3",
    name: "Cliente de demonstração 3",
    email: "cliente3@example.com",
    status: "pending",
    createdAt: "2026-10-05",
    isDemo: true,
  },
  {
    id: "user-4",
    name: "Cliente de demonstração 4",
    email: "cliente4@example.com",
    status: "suspended",
    createdAt: "2026-08-30",
    isDemo: true,
  },
];

export const adminUserStatusLabel: Record<AdminUserStatus, string> = {
  active: "Ativo",
  pending: "Por confirmar",
  suspended: "Suspenso",
};
