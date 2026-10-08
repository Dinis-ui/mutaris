import { cookies } from "next/headers";
import { BACKOFFICE_SESSION_COOKIE, verifySessionToken } from "@/lib/backoffice-auth";
import { findAdminByEmail, type AdminAccount } from "@/lib/backoffice-admins";

/** Administrador com sessão válida (ou null). Só para código de servidor. */
export async function getCurrentAdmin(): Promise<Pick<AdminAccount, "email" | "name"> | null> {
  const store = await cookies();
  const session = await verifySessionToken(store.get(BACKOFFICE_SESSION_COOKIE)?.value);
  if (!session) return null;

  const admin = findAdminByEmail(session.email);
  return admin ? { email: admin.email, name: admin.name } : null;
}
