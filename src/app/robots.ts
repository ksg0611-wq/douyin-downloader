// Robots.txt configuration for search engine crawlers
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://douyin-downloader-amber.vercel.app/sitemap.xml',
  };
}
