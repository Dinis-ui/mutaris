import type { ProductCategory } from "@workspace/types";

/**
 * Categorias de filtro da Loja. Esta lista não é definitiva — para
 * adicionar, renomear ou remover categorias, basta editar aqui.
 */
export const productCategories: ProductCategory[] = [
  { id: "intrusao", slug: "intrusao", name: "Intrusão", icon: "shield-check" },
  { id: "videovigilancia", slug: "videovigilancia", name: "Videovigilância", icon: "video" },
  { id: "deteccao-agua", slug: "deteccao-agua", name: "Deteção de água", icon: "droplets" },
  { id: "incendio", slug: "incendio", name: "Incêndio", icon: "flame" },
  {
    id: "controlo-acessos",
    slug: "controlo-acessos",
    name: "Controlo de acessos",
    icon: "key-round",
  },
];