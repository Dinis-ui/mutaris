import type { FeaturedSolution } from "@workspace/types";

export const featuredSolutions: FeaturedSolution[] = [
  {
    id: "home",
    slug: "home",
    name: "HOME",
    categorySlug: "casa",
    tagline: "Segurança completa para toda a casa.",
    highlights: [
      "Câmaras interiores e exteriores",
      "Sensores de abertura e movimento",
      "Alertas em tempo real na app",
    ],
    priceFrom: 249,
    currency: "EUR",
  },
  {
    id: "water",
    slug: "water",
    name: "WATER",
    categorySlug: "agua",
    tagline: "Deteta fugas antes que causem danos.",
    highlights: [
      "Sensores de fuga de água",
      "Corte automático da água (opcional)",
      "Notificações imediatas",
    ],
    priceFrom: 129,
    currency: "EUR",
  },
  {
    id: "business",
    slug: "business",
    name: "BUSINESS",
    categorySlug: "negocio",
    tagline: "Proteção pensada para pequenos negócios.",
    highlights: [
      "Controlo de acessos",
      "Videovigilância 24/7",
      "Gestão de várias localizações",
    ],
    priceFrom: 399,
    currency: "EUR",
  },
];
