import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/my-toolbox"],
    },
    sitemap: "https://shortspack.com/sitemap.xml",
  };
}
