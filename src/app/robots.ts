import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/login", "/signup", "/studio"],
    },
    sitemap: "https://hallcraft.online/sitemap.xml",
    host: "https://hallcraft.online",
  };
}
