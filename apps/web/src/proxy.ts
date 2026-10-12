import { NextResponse, type NextRequest } from "next/server";
import { BACKOFFICE_SESSION_COOKIE } from "@/lib/backoffice-auth";

/**
 * Primeira barreira (ficheiro `proxy`, antigo `middleware`) do `/backoffice`: sem cookie de sessão, vai para o
 * login. Isto NÃO valida a sessão (o proxy não acede à base de
 * dados) — a validação real é feita no servidor, junto dos dados, por
 * `requireAdmin()` em `lib/backoffice-session-server.ts`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/backoffice/login";
  const hasSessionCookie = Boolean(request.cookies.get(BACKOFFICE_SESSION_COOKIE)?.value);

  if (!hasSessionCookie && !isLoginRoute) {
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
