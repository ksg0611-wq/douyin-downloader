import { MetadataRoute } from "next";
import { getSortedPostsData } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shortspack.com";

  // 1. Define static routes
  const staticRoutes = [
    { url: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { url: "/downloader", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "/my-toolbox", changeFrequency: "monthly" as const, priority: 0.3 },
    { url: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { url: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/safe-zone", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/bpm-calculator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/shadowban-scanner", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/hook-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/viral-analyzer", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/thumbnail-text-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/algo-hook-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/upload-time-calculator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/sponsor-pitch-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/sponsor-pitch-generator", changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 2. Fetch and map blog posts dynamically
  const posts = getSortedPostsData();

  const blogUrls = posts.map((post) => {
    let lastModified = new Date();
    if (post.date) {
      try {
        const formattedDate = post.date.replace(/\./g, "-").replace(/\s/g, "");
        lastModified = new Date(formattedDate);
        if (isNaN(lastModified.getTime())) {
          lastModified = new Date();
        }
      } catch (e) {
        lastModified = new Date();
      }
    }

    return {
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  return [...staticUrls, ...blogUrls];
}
