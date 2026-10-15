function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const raw = explicit || (vercel ? `https://${vercel}` : "https://mutaris.pt");
  return raw.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "MUTARIS",
  tagline: "Tecnologia que protege o que importa.",
  description:
    "Soluções inteligentes de segurança para casas e pequenos negócios em Portugal: da deteção à instalação, sem complicações.",
  // Endereço público do site. Define NEXT_PUBLIC_SITE_URL quando houver domínio próprio;
  // até lá usa o endereço de produção da Vercel (VERCEL_PROJECT_PRODUCTION_URL).
  url: resolveSiteUrl(),
  locale: "pt-PT",
} as const;
