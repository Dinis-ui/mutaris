import { NextResponse } from "next/server";
import { authenticateCustomer } from "@/lib/customer-users";
import { createUserSession } from "@/lib/customer-session-server";
import { clientIp, setCustomerSessionCookie } from "@/lib/customer-cookie";
import { PASSWORD_MAX_LENGTH, normalizeEmail } from "@/lib/customer-auth";
import { clearFailures, isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password || password.length > PASSWORD_MAX_LENGTH) {
    return NextResponse.json({ error: "Indica o email e a palavra-passe." }, { status: 400 });
  }

  const attempt = { ip: clientIp(request), email, scope: "customer" as const };

  let token: string;
  try {
    if (await isRateLimited(attempt)) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." },
        { status: 429 },
      );
    }

    const result = await authenticateCustomer(email, password);
    if (result.status === "invalid") {
      await registerFailure(attempt);
      return NextResponse.json({ error: "Email ou palavra-passe incorretos." }, { status: 401 });
    }
    if (result.status === "suspended") {
      return NextResponse.json(
        { error: "Esta conta está suspensa. Contacta o suporte para saberes mais." },
        { status: 403 },
      );
    }

    token = await createUserSession(result.account.id);
    await clearFailures(attempt);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível iniciar sessão neste momento. Tenta novamente." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true });
  setCustomerSessionCookie(response, token);
  return response;
}
