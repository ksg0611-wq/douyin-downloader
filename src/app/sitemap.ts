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
    // post.date가 없는 경우를 대비하여 방어 코드 추가 (Optional Chaining 및 Fallback)
    lastModified: post.date 
      ? new Date(post.date.replace(/\./g, '-').replace(/\s/g, '')).toISOString() 
      : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes];
}
