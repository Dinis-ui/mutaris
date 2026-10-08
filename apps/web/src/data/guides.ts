export interface Guide {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  /** True para conteúdo de demonstração, antes de existirem guias reais. */
  isDemo: boolean;
}

/**
 * Ainda não existem guias reais da MUTARIS. Estes são conteúdos de
 * demonstração — claramente identificados como "Exemplo" na interface —
 * só para mostrar como a área de guias vai funcionar.
 */
export const guides: Guide[] = [
  {
    id: "sinais-de-intrusao",
    slug: "sinais-de-intrusao",
    title: "Sinais de que a tua casa pode estar vulnerável",
    description: "O que vale a pena verificar antes de pensar em equipamento.",
    categorySlug: "intrusao",
    isDemo: true,
  },
  {
    id: "identificar-fuga-de-agua",
    slug: "identificar-fuga-de-agua",
    title: "Como identificar uma fuga de água a tempo",
    description: "Os primeiros sinais a que deves prestar atenção.",
    categorySlug: "fugas-de-agua",
    isDemo: true,
  },
  {
    id: "antes-de-instalar-cameras",
    slug: "antes-de-instalar-cameras",
    title: "O que considerar antes de instalar câmaras",
    description: "Perguntas simples para decidires com mais confiança.",
    categorySlug: "videovigilancia",
    isDemo: true,
  },
  {
    id: "por-onde-comecar-casa",
    slug: "por-onde-comecar-casa",
    title: "Por onde começar a proteger a tua casa",
    description: "Um ponto de partida simples, sem complicações técnicas.",
    categorySlug: "seguranca-casa",
    isDemo: true,
  },
  {
    id: "por-onde-comecar-negocio",
    slug: "por-onde-comecar-negocio",
    title: "Segurança para pequenos negócios: por onde começar",
    description: "As primeiras perguntas a fazer antes de escolher uma solução.",
    categorySlug: "seguranca-negocios",
    isDemo: true,
  },
];
