---
name: blog-seo
description: Technical SEO skill for blogs focusing on AI crawler optimization, performance, and Cloudflare deployment.
---

# Blog SEO Technical

## Technical Checklist

### Performance (Core Web Vitals)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images: WebP/AVIF, lazy loading
- [ ] Critical CSS inline

### Structure
```html
<!-- Każdy post -->
<article itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">Tytuł</h1>
  <meta itemprop="datePublished" content="2026-02-19">
  <meta itemprop="author" content="Bonzo">

  <div itemprop="articleBody">
    <!-- Content -->
  </div>
</article>
```

### URL Structure
```
/blog/{category}/{slug}/

Examples:
/blog/ai/detect-ai-bots/
/blog/cloudflare/workers-deployment/
/blog/devops/docker-best-practices/
```

### Internal Linking
- 3-5 internal links per post
- Related posts section
- Breadcrumb navigation

### Image Optimization
```astro
---
// Image component z schema
const { src, alt, width, height } = Astro.props;
---

<picture>
  <source srcset={getImage(src, {format: 'avif'})} type="image/avif">
  <source srcset={getImage(src, {format: 'webp'})} type="image/webp">
  <img 
    src={src} 
    alt={alt}
    width={width}
    height={height}
    loading="lazy"
    itemprop="image"
  />
</picture>
```

### Sitemap dla AI
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>https://jimbo77.org/blog/post</loc>
    <lastmod>2026-02-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## Cloudflare Optimization

### Workers Configuration
```javascript
// _worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cache static assets
    if (url.pathname.match(/\.(js|css|woff2|avif|webp)$/)) {
      return cacheFirst(request, env);
    }

    // HTML - network first
    return networkFirst(request, env);
  }
}
```

### R2 for Heavy Assets
- Images > 100KB → R2
- PDFs → R2
- Videos → Stream

### D1 for Dynamic Content
- Blog metadata
- View counts
- Related posts
