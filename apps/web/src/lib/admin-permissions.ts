/**
 * Perfis de permissões dos administradores. Sem dependências de servidor,
 * por isso pode ser usado em componentes e testes.
 *
 * - `read`    (leitura): vê tudo no backoffice, não altera nada.
 * - `support` (suporte): como leitura + gere pedidos de suporte.
 * - `full`    (total): tudo — loja, encomendas, clientes e administradores.
 *
 * Quem dá uma conta a um agente de IA deve começar por `read`.
 */
export const ADMIN_ROLES = ["read", "support", "full"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = ["view", "support", "manage", "admins"] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  read: ["view"],
  support: ["view", "support"],
  full: ["view", "support", "manage", "admins"],
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  read: "Leitura",
  support: "Suporte",
  full: "Total",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  read: "Vê tudo, não altera nada.",
  support: "Vê tudo e trata dos pedidos de suporte.",
  full: "Acesso total: loja, encomendas, clientes e administradores.",
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as readonly string[]).includes(value);
}

/** Perfil desconhecido não tem permissões (falha para o lado seguro). */
export function roleHasPermission(role: string, permission: AdminPermission): boolean {
  return isAdminRole(role) && ROLE_PERMISSIONS[role].includes(permission);
}

export const FORBIDDEN_MESSAGE = "Não tens permissão para esta ação.";
