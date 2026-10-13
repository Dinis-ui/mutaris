import { NextResponse } from "next/server";
import { registerCustomer } from "@/lib/customer-users";
import { createUserSession } from "@/lib/customer-session-server";
import { clientIp, setCustomerSessionCookie } from "@/lib/customer-cookie";
import { normalizeEmail, validateRegistration } from "@/lib/customer-auth";
import { isRateLimited, registerFailure } from "@/lib/backoffice-rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const input = {
    name: typeof body?.name === "string" ? body.name : "",
    email: typeof body?.email === "string" ? normalizeEmail(body.email) : "",
    password: typeof body?.password === "string" ? body.password : "",
    acceptTerms: body?.acceptTerms === true,
  };

  const errors = validateRegistration(input);
  const firstError = Object.values(errors)[0];
  if (firstError) {
    return NextResponse.json({ error: firstError, fields: errors }, { status: 400 });
  }

  // Cada tentativa de registo conta para o limite (também as bem-sucedidas).
  const attempt = { ip: clientIp(request), email: input.email, scope: "register" as const };

  let token: string;
  try {
    if (await isRateLimited(attempt)) {
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tenta novamente dentro de alguns minutos." },
        { status: 429 },
      );
    }
    await registerFailure(attempt);

    const account = await registerCustomer(input);
    if (!account) {
      return NextResponse.json(
        { error: "Já existe uma conta com este email. Tenta entrar." },
        { status: 409 },
      );
    }

    token = await createUserSession(account.id);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a conta neste momento. Tenta novamente." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  setCustomerSessionCookie(response, token);
  return response;
}
