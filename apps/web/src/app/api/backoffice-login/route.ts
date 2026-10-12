import { NextResponse } from "next/server";
import { BACKOFFICE_SESSION_COOKIE, BACKOFFICE_SESSION_MAX_AGE } from "@/lib/backoffice-auth";
import { authenticateAdmin } from "@/lib/backoffice-admins";
import { createAdminSession } from "@/lib/backoffice-session-server";
import { clearFailures, isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Indica o email e a password." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limitKey = `${ip}|${email}`;

  if (isRateLimited(limitKey)) {
    return NextResponse.json(
      { error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." },
      { status: 429 },
    );
  }

  let token: string;
  try {
    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      registerFailure(limitKey);
      return NextResponse.json({ error: "Email ou password incorretos." }, { status: 401 });
    }
    token = await createAdminSession(admin.id);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ligar à base de dados. Tenta novamente." },
      { status: 503 },
    );
  }

  clearFailures(limitKey);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(BACKOFFICE_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: BACKOFFICE_SESSION_MAX_AGE,
  });
  return response;
}
