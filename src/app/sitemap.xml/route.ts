import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/posts';

export async function GET() {
  const baseUrl = 'https://douyin-downloader-amber.vercel.app';
  const posts = getSortedPostsData();

  const staticRoutes = ['', '/download', '/privacy', '/terms'];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('')}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${
      post.date
        ? new Date(post.date.replace(/\./g, '-').replace(/\s/g, '')).toISOString()
        : new Date().toISOString()
    }</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('')}
</urlset>
`;

  return new NextResponse(sitemapXml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}
