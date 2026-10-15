import { describe, expect, it } from "vitest";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  isAdminRole,
  roleHasPermission,
} from "@/lib/admin-permissions";

describe("roleHasPermission", () => {
  it("leitura só pode ver", () => {
    expect(roleHasPermission("read", "view")).toBe(true);
    expect(
      ADMIN_PERMISSIONS.filter((p) => p !== "view").some((p) =>
        roleHasPermission("read", p),
      ),
    ).toBe(false);
  });

  it("suporte vê e trata de pedidos de suporte, mas não gere loja nem administradores", () => {
    expect(roleHasPermission("support", "view")).toBe(true);
    expect(roleHasPermission("support", "support")).toBe(true);
    expect(roleHasPermission("support", "manage")).toBe(false);
    expect(roleHasPermission("support", "admins")).toBe(false);
  });

  it("total tem todas as permissões", () => {
    expect(ADMIN_PERMISSIONS.every((p) => roleHasPermission("full", p))).toBe(true);
  });

  it("perfil desconhecido não tem permissões", () => {
    expect(ADMIN_PERMISSIONS.some((p) => roleHasPermission("root", p))).toBe(false);
  });
});

describe("isAdminRole", () => {
  it("aceita só perfis conhecidos", () => {
    expect(ADMIN_ROLES.every(isAdminRole)).toBe(true);
    expect(isAdminRole("admin")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
