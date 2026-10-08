import type { IconName } from "@workspace/types";

export interface SupportCategory {
  id: string;
  /** Reserved for when each category links to a real guide/article. */
  slug: string;
  name: string;
  icon: IconName;
}

/**
 * Support topics. There are no articles behind them yet, so they render as
 * plain, non-clickable labels — the slug is only here so a future guides
 * section can wire real links without changing this list.
 */
export const supportCategories: SupportCategory[] = [
  { id: "alarmes", slug: "alarmes-e-intrusao", name: "Alarmes e intrusão", icon: "shield-check" },
  { id: "video", slug: "videovigilancia", name: "Videovigilância", icon: "video" },
  { id: "agua", slug: "deteccao-de-agua", name: "Deteção de água", icon: "droplets" },
  { id: "instalacao", slug: "instalacao", name: "Instalação", icon: "sliders" },
  { id: "configuracao", slug: "configuracao", name: "Configuração", icon: "settings" },
  { id: "encomendas", slug: "encomendas", name: "Encomendas", icon: "package" },
  { id: "conta-pagamentos", slug: "conta-e-pagamentos", name: "Conta e pagamentos", icon: "user" },
];