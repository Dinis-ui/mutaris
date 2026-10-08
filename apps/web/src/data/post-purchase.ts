export interface PostPurchaseStep {
  id: string;
  number: string;
  title: string;
  description: string;
}

export const postPurchaseSteps: PostPurchaseStep[] = [
  {
    id: "step-1",
    number: "01",
    title: "Recebes",
    description: "A encomenda chega com tudo o que faz parte da tua solução.",
  },
  {
    id: "step-2",
    number: "02",
    title: "Confirmas o conteúdo",
    description: "Verificas se está tudo de acordo com o que encomendaste.",
  },
  {
    id: "step-3",
    number: "03",
    title: "Segues o guia",
    description: "Um guia pensado para quem nunca instalou nada.",
  },
  {
    id: "step-4",
    number: "04",
    title: "Instalas",
    description: "No teu ritmo, equipamento a equipamento.",
  },
  {
    id: "step-5",
    number: "05",
    title: "Configuras",
    description: "Defines as tuas preferências e deixas tudo a funcionar.",
  },
  {
    id: "step-6",
    number: "06",
    title: "Está pronto",
    description: "A tua solução ativa, pronta a proteger o que importa.",
  },
];
