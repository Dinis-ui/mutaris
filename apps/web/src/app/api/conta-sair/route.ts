import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE } from "@/lib/customer-auth";
import { destroyUserSession } from "@/lib/customer-session-server";

export async function POST() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (token) {
    try {
      await destroyUserSession(token);
    } catch {
      // Mesmo que a base de dados falhe, o cookie é apagado abaixo.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
