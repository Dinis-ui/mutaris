import type { Product } from "@workspace/types";

/**
 * CATÁLOGO DE DEMONSTRAÇÃO TEMPORÁRIO.
 *
 * Nenhum destes é um produto real da MUTARIS — nomes, descrições e
 * preços são placeholders (`isDemo: true`) só para exercitar a loja
 * (pesquisa, filtros, ordenação, página de produto) antes de existir o
 * catálogo real. Substitui o conteúdo deste ficheiro mais tarde; nada
 * nos componentes da loja precisa de mudar para isso.
 */
export const products: Product[] = [
  {
    id: "demo-sensor-abertura",
    slug: "sensor-de-abertura-demo",
    name: "Sensor de abertura — Demo",
    category: "intrusao",
    description: "Deteta a abertura de uma porta ou janela e envia um alerta.",
    price: 39,
    currency: "EUR",
    availability: "disponivel",
    features: ["Deteção de abertura", "Alerta na app"],
    solutionIds: ["home"],
    isDemo: true,
  },
  {
    id: "demo-sensor-movimento",
    slug: "sensor-de-movimento-demo",
    name: "Sensor de movimento — Demo",
    category: "intrusao",
    description: "Deteta movimento numa divisão e envia um alerta.",
    price: 45,
    currency: "EUR",
    availability: "disponivel",
    features: ["Deteção de movimento", "Alerta na app"],
    solutionIds: ["home"],
    isDemo: true,
  },
  {
    id: "demo-camara-exterior",
    slug: "camara-exterior-demo",
    name: "Câmara exterior — Demo",
    category: "videovigilancia",
    description: "Câmara para vigilância da parte exterior de uma casa ou negócio.",
    price: 89,
    currency: "EUR",
    availability: "disponivel",
    features: ["Vídeo em direto na app"],
    solutionIds: ["home", "business"],
    isDemo: true,
  },
  {
    id: "demo-camara-interior",
    slug: "camara-interior-demo",
    name: "Câmara interior — Demo",
    category: "videovigilancia",
    description: "Câmara para vigilância do interior de uma casa ou negócio.",
    price: 69,
    currency: "EUR",
    availability: "sob-consulta",
    features: ["Vídeo em direto na app"],
    solutionIds: ["home"],
    isDemo: true,
  },
  {
    id: "demo-sensor-fuga-agua",
    slug: "sensor-de-fuga-de-agua-demo",
    name: "Sensor de fuga de água — Demo",
    category: "deteccao-agua",
    description: "Deteta a presença de água onde não é esperada e envia um alerta.",
    price: 35,
    currency: "EUR",
    availability: "disponivel",
    features: ["Deteção de fuga de água", "Alerta na app"],
    solutionIds: ["water"],
    isDemo: true,
  },
  {
    id: "demo-detetor-fumo",
    slug: "detetor-de-fumo-demo",
    name: "Detetor de fumo — Demo",
    category: "incendio",
    description: "Deteta a presença de fumo numa divisão.",
    price: 49,
    currency: "EUR",
    availability: "brevemente",
    features: ["Deteção de fumo"],
    solutionIds: [],
    isDemo: true,
  },
  {
    id: "demo-leitor-acessos",
    slug: "leitor-de-acessos-demo",
    name: "Leitor de acessos — Demo",
    category: "controlo-acessos",
    description: "Controla a entrada num espaço através de cartão ou código.",
    price: 129,
    currency: "EUR",
    availability: "sob-consulta",
    features: ["Controlo de entrada por cartão ou código"],
    solutionIds: ["business"],
    isDemo: true,
  },
];