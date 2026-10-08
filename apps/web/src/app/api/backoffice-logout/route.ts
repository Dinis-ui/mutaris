import { NextResponse } from "next/server";
import { BACKOFFICE_SESSION_COOKIE } from "@/lib/backoffice-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(BACKOFFICE_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
