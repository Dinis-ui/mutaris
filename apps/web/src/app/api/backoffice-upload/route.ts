import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { arrayContains, eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { roleHasPermission } from "@/lib/admin-permissions";
import { getCurrentAdmin } from "@/lib/backoffice-session-server";
import {
  PRODUCT_IMAGE_EXTENSION,
  PRODUCT_IMAGE_MAX_BYTES,
  detectImageType,
  isBlobImageUrl,
} from "@/lib/product-image";

/** Upload de imagens de produto (só administradores). Devolve o endereço público da imagem. */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sessão expirada. Entra outra vez." }, { status: 401 });
  }
  if (!roleHasPermission(admin.role, "manage")) {
    return NextResponse.json({ error: "Não tens permissão para esta ação." }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "O armazenamento de imagens ainda não está configurado." },
      { status: 503 },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > PRODUCT_IMAGE_MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "A imagem é demasiado grande (máximo 4 MB)." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Escolhe uma imagem." }, { status: 400 });
  }
  if (file.size === 0 || file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return NextResponse.json({ error: "A imagem é demasiado grande (máximo 4 MB)." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) {
    return NextResponse.json({ error: "Usa uma imagem JPG, PNG ou WebP." }, { status: 415 });
  }

  try {
    const name = `produtos/${randomBytes(12).toString("hex")}.${PRODUCT_IMAGE_EXTENSION[type]}`;
    const blob = await put(name, new Blob([bytes], { type }), {
      access: "public",
      contentType: type,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível guardar a imagem. Tenta novamente." },
      { status: 502 },
    );
  }
}

/** Apaga uma imagem enviada mas não guardada (usada ao remover/cancelar no formulário). */
export async function DELETE(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
  if (!roleHasPermission(admin.role, "manage")) {
    return NextResponse.json({ error: "Não tens permissão para esta ação." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const url = body?.url;
  if (!isBlobImageUrl(url) || !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: true });
  }
  try {
    // Nunca apaga uma imagem que um produto está a usar.
    const [inUse] = await getDb()
      .select({ id: products.id })
      .from(products)
      .where(or(eq(products.image, url), arrayContains(products.images, [url])))
      .limit(1);
    if (!inUse) await del(url);
  } catch {
    // Melhor esforço: uma imagem esquecida no armazenamento não afeta ninguém.
  }
  return NextResponse.json({ ok: true });
}
