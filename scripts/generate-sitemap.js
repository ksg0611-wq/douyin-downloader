const fs = require('fs');
const path = require('path');

const baseUrl = 'https://shortspack.com';
const postsDirectory = path.join(process.cwd(), 'content/posts');
const publicDirectory = path.join(process.cwd(), 'public');

function generateSitemap() {
  console.log('Generating sitemap.xml...');
  
  const staticRoutes = ['', '/blog', '/privacy', '/terms'];
  
  let posts = [];
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory);
    posts = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Simple frontmatter parsing for date
        let date = '2026-05-26';
        const dateMatch = fileContents.match(/date:\s*["']([^"']+)["']/);
        if (dateMatch && dateMatch[1]) {
          date = dateMatch[1];
        }
        
        return { id, date };
      });
  }

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
</urlset>`;

  fs.writeFileSync(path.join(publicDirectory, 'sitemap.xml'), sitemapXml.trim());
  console.log('sitemap.xml generated successfully inside public/ directory!');
}

function generateRobots() {
  console.log('Generating robots.txt...');
  
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

  fs.writeFileSync(path.join(publicDirectory, 'robots.txt'), robotsTxt.trim());
  console.log('robots.txt generated successfully inside public/ directory!');
}

try {
  generateSitemap();
  generateRobots();
} catch (error) {
  console.error('Error generating SEO files:', error);
  process.exit(1);
}
