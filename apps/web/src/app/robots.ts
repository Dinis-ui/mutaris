import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/backoffice", "/conta", "/api/", "/entrar", "/registar", "/carrinho"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
