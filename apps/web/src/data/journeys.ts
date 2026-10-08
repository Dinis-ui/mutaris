import type { IconName } from "@workspace/types";

export interface JourneyStep {
  title: string;
  description: string;
}

export interface Journey {
  id: string;
  /** Label shown on the selector button. */
  label: string;
  icon: IconName;
  /** First-person sentence that frames the journey, e.g. "Quero proteger a minha casa." */
  quote: string;
  /** Shown only for the illustrative "problema específico" journey. */
  note?: string;
  steps: JourneyStep[];
}

/**
 * The overarching, conceptual funnel shown above the journeys. It is a visual
 * motif, not a literal 1-to-1 mapping to each journey's steps below.
 */
export const macroStages = [
  "Necessidade",
  "Solução",
  "Equipamento",
  "Instalação",
  "Proteção",
] as const;

export const journeys: Journey[] = [
  {
    id: "casa",
    label: "Casa",
    icon: "house",
    quote: "Quero proteger a minha casa.",
    steps: [
      {
        title: "Perceber o que é necessário",
        description: "Contas-nos como é a tua casa e o que te preocupa.",
      },
      {
        title: "Configurar a solução",
        description: "Escolhemos e ajustamos os equipamentos ao teu caso.",
      },
      {
        title: "Receber os equipamentos",
        description: "Chega tudo o que precisas, identificado e pronto a instalar.",
      },
      {
        title: "Instalar",
        description: "Seguindo o guia passo a passo que enviamos contigo.",
      },
      {
        title: "Solução pronta",
        description: "A tua casa protegida, com tudo sob o teu controlo.",
      },
    ],
  },
  {
    id: "negocio",
    label: "Negócio",
    icon: "store",
    quote: "Quero proteger o meu negócio.",
    steps: [
      {
        title: "Identificar o espaço",
        description: "Percebemos o tipo de negócio e os pontos a cobrir.",
      },
      {
        title: "Escolher as necessidades",
        description: "Definimos, contigo, o que faz sentido proteger primeiro.",
      },
      {
        title: "Configurar a solução",
        description: "Ajustamos os equipamentos à realidade do espaço.",
      },
      {
        title: "Receber os equipamentos",
        description: "Recebes tudo, identificado e pronto a montar.",
      },
      {
        title: "Instalar e configurar",
        description: "Colocado a funcionar, com ou sem apoio profissional.",
      },
    ],
  },
  {
    id: "problema",
    label: "Um problema específico",
    icon: "droplets",
    quote: "Tenho uma fuga de água.",
    note: "Este é apenas um exemplo — outros problemas seguem o mesmo caminho.",
    steps: [
      {
        title: "Identificar o problema",
        description: "Descreves o que já aconteceu ou o que temes que aconteça.",
      },
      {
        title: "Encontrar o equipamento adequado",
        description: "Indicamos o sensor ou solução certa para o teu caso.",
      },
      {
        title: "Receber o equipamento",
        description: "Chega-te a casa, identificado e pronto a instalar.",
      },
      {
        title: "Instalar",
        description: "Colocação simples, seguindo o guia incluído.",
      },
      {
        title: "Receber alertas",
        description: "Passas a saber, em tempo real, se algo sair do previsto.",
      },
    ],
  },
];
