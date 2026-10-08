import type { ProblemCategory } from "@workspace/types";

export const problemCategories: ProblemCategory[] = [
  {
    id: "casa",
    slug: "casa",
    name: "Casa",
    description: "Alarmes, sensores e câmaras para proteger toda a casa.",
    icon: "house",
  },
  {
    id: "negocio",
    slug: "negocio",
    name: "Negócio",
    description: "Proteção para lojas, escritórios e armazéns.",
    icon: "store",
  },
  {
    id: "agua",
    slug: "agua",
    name: "Água",
    description: "Deteção de fugas antes que se tornem um problema.",
    icon: "droplets",
  },
  {
    id: "incendio",
    slug: "incendio",
    name: "Incêndio",
    description: "Deteção de fumo e calor com alertas imediatos.",
    icon: "flame",
  },
  {
    id: "video",
    slug: "video",
    name: "Vídeo",
    description: "Vigilância inteligente dentro e fora de casa.",
    icon: "video",
  },
];
