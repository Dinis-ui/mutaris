import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { BACKOFFICE_SESSION_COOKIE } from "@/lib/backoffice-auth";
import { destroyAdminSession } from "@/lib/backoffice-session-server";

export async function POST() {
  const store = await cookies();
  const token = store.get(BACKOFFICE_SESSION_COOKIE)?.value;

  if (token) {
    try {
      await destroyAdminSession(token);
    } catch {
      // Mesmo que a base de dados falhe, o cookie é apagado abaixo.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(BACKOFFICE_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
