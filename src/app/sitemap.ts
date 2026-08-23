import { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blogPosts";
import { getSortedPostsData } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shortspack.com";

  // 1. Define clean canonical static routes (excluding 301 redirected legacy endpoints)
  const staticRoutes = [
    { url: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { url: "/blog", changeFrequency: "daily" as const, priority: 0.9 },
    { url: "/downloader", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "/tools", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "/tools/hook-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/hashtag-scanner", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/tempo-calculator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/sponsor-pitch-generator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/script-framework", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/cta-wizard", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/ctr-title", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/tools/comment-engagement", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/safe-zone", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/shadowban-scanner", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/viral-analyzer", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/upload-time-calculator", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/privacy", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { url: "/support", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // 2. Map the 22 canonical blog posts
  const canonicalBlogUrls = BLOG_POSTS.map((post) => {
    let lastModified = new Date();
    if (post.date) {
      try {
        const matches = post.date.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (matches) {
          const [, y, m, d] = matches;
          lastModified = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
        }
      } catch {
        lastModified = new Date();
      }
    }

    return {
      url: `${baseUrl}${post.href}`,
      lastModified: lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  // 3. Map any additional markdown posts that are not in BLOG_POSTS and not redirected
  const canonicalBlogSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
  const redirectedSlugs = new Set([
    "ga4-marketing-data-analysis",
    "firebase-serverless-marketing-webapp",
    "seasonal-high-ticket-cpa-keywords",
    "adsense-approval-seo-structure",
    "adsense-placement-optimization-webapp",
    "technical-seo-information-processing",
  ]);

  const additionalMarkdownPosts = getSortedPostsData()
    .filter((post) => !canonicalBlogSlugs.has(post.id) && !redirectedSlugs.has(post.id))
    .map((post) => {
      let lastModified = new Date();
      if (post.date) {
        try {
          const formattedDate = post.date.replace(/\./g, "-").replace(/\s/g, "");
          lastModified = new Date(formattedDate);
          if (isNaN(lastModified.getTime())) {
            lastModified = new Date();
          }
        } catch {
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

  return [...staticUrls, ...canonicalBlogUrls, ...additionalMarkdownPosts];
}
