import { NextResponse } from "next/server";
import { BACKOFFICE_SESSION_COOKIE, BACKOFFICE_SESSION_MAX_AGE } from "@/lib/backoffice-auth";
import { authenticateAdmin } from "@/lib/backoffice-admins";
import { recordActivity } from "@/lib/audit";
import { createAdminSession } from "@/lib/backoffice-session-server";
import { getMigrationStatus } from "@/lib/migration-status";
import { clearFailures, isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Indica o email e a password." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const attempt = { ip, email };

  let token: string;
  try {
    if (await isRateLimited(attempt)) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." },
        { status: 429 },
      );
    }

    const admin = await authenticateAdmin(email, password);
    if (!admin) {
      await registerFailure(attempt);
      return NextResponse.json({ error: "Email ou password incorretos." }, { status: 401 });
    }

    token = await createAdminSession(admin.id);
    await clearFailures(attempt);
    await recordActivity({ action: "admin.login", actor: { id: admin.id, name: admin.name } });
  } catch (error) {
    console.error("Falha no login do backoffice:", error);
    const migrations = await getMigrationStatus();
    return NextResponse.json(
      {
        error:
          migrations.state === "pending"
            ? "A base de dados pode estar desatualizada (migrações por aplicar). Corre npm run db:migrate."
            : "Não foi possível ligar à base de dados. Tenta novamente.",
      },
      { status: 503 },
    );
  }

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
