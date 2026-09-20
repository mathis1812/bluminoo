import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bluminoo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/gallery"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
