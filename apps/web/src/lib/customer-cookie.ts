import type { NextResponse } from "next/server";
import { CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_MAX_AGE } from "@/lib/customer-auth";

/** Define o cookie de sessão do cliente (httpOnly, Secure em produção). */
export function setCustomerSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  });
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
