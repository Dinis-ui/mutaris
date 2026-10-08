import type { IconName } from "@workspace/types";

export interface GuideCategory {
  id: string;
  slug: string;
  name: string;
  icon: IconName;
}

export const guideCategories: GuideCategory[] = [
  { id: "intrusao", slug: "intrusao", name: "Intrusão", icon: "shield-check" },
  { id: "fugas-de-agua", slug: "fugas-de-agua", name: "Fugas de água", icon: "droplets" },
  { id: "videovigilancia", slug: "videovigilancia", name: "Videovigilância", icon: "video" },
  { id: "seguranca-casa", slug: "seguranca-casa", name: "Segurança para casa", icon: "house" },
  {
    id: "seguranca-negocios",
    slug: "seguranca-negocios",
    name: "Segurança para negócios",
    icon: "store",
  },
];
