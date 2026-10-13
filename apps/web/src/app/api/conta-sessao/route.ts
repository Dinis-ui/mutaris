import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/customer-session-server";

// Depende do cookie: nunca guardar em cache.
export const dynamic = "force-dynamic";

/** Diz ao menu do cabeçalho se há sessão (as páginas públicas continuam estáticas). */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    user ? { signedIn: true, name: user.name } : { signedIn: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
