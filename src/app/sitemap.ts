import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://douyin-downloader-amber.vercel.app';

  // 정적 페이지 경로
  const routes = ['', '/download', '/privacy', '/terms'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 동적 마크다운 블로그 페이지 경로 추출
  const posts = getSortedPostsData();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    // 날짜 포맷 (예: '2024. 05. 25')을 유효한 ISO 포맷('2024-05-25')으로 변환
    lastModified: new Date(post.date.replace(/\./g, '-').replace(/\s/g, '')).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes];
}
