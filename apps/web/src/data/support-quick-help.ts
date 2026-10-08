import type { IconName } from "@workspace/types";

export interface QuickHelpItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: IconName;
}

/**
 * The four entry points into support. Each links to something that already
 * exists today (a page or an in-page anchor) — no placeholder destinations.
 */
export const quickHelpItems: QuickHelpItem[] = [
  {
    id: "antes-da-compra",
    title: "Antes da compra",
    description: "Não sabes qual solução escolher?",
    href: "/#encontrar-solucao",
    icon: "search",
  },
  {
    id: "instalacao-configuracao",
    title: "Instalação e configuração",
    description: "Precisas de ajuda a pôr o equipamento a funcionar?",
    href: "#categorias",
    icon: "sliders",
  },
  {
    id: "encomendas",
    title: "Encomendas",
    description: "Queres saber o estado da tua encomenda?",
    href: "/conta/pedidos",
    icon: "package",
  },
  {
    id: "problemas",
    title: "Problemas com uma solução",
    description: "Alguma coisa não está a funcionar como esperavas?",
    href: "/conta/suporte",
    icon: "life-buoy",
  },
];