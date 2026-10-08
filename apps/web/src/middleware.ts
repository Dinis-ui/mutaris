import { NextResponse, type NextRequest } from "next/server";
import { BACKOFFICE_SESSION_COOKIE, verifySessionToken } from "@/lib/backoffice-auth";

/**
 * Impede o acesso a `/backoffice` sem uma sessão de administrador válida
 * (cookie assinado — ver `lib/backoffice-auth.ts`). Quando os dados do
 * backoffice forem reais, a verificação deve repetir-se também junto dos
 * dados, e não depender só deste middleware.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/backoffice/login";
  const session = await verifySessionToken(request.cookies.get(BACKOFFICE_SESSION_COOKIE)?.value);

  if (!session && !isLoginRoute) {
    return NextResponse.redirect(new URL("/backoffice/login", request.url));
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL("/backoffice", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*"],
};
