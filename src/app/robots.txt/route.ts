import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://douyin-downloader-amber.vercel.app/sitemap.xml
`;

  return new NextResponse(robotsTxt.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}
