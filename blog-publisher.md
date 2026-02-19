---
name: blog-publisher
description: Publishing workflow skill for blogs. Manages content pipeline from draft to deployment on Cloudflare Pages.
---

# Blog Publisher Workflow

## Publishing Pipeline

```
Draft → Review → SEO Check → Schema Add → Preview → Deploy → Promote
```

## Pre-Publish Checklist

### Content
- [ ] Title < 60 chars, compelling
- [ ] Meta description < 160 chars
- [ ] H1 only one per page
- [ ] H2-H3 hierarchy correct
- [ ] 3-5 internal links
- [ ] 2-3 external authority links
- [ ] Images optimized (WebP, alt text)

### SEO
- [ ] Schema markup added
- [ ] Canonical URL set
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] robots meta correct

### Conversion
- [ ] CTA present
- [ ] Lead magnet linked
- [ ] Email signup visible

## Deployment Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Deploy to Cloudflare Pages
git add .
git commit -m "feat: new blog post - {title}"
git push origin main
# Cloudflare auto-deploys from GitHub
```

## Post-Publish Actions

### Immediate (0-1h)
- [ ] Verify deployment successful
- [ ] Check all links work
- [ ] Test on mobile
- [ ] Submit to Google Search Console

### Short-term (1-24h)
- [ ] Share on social media
- [ ] Send to email list
- [ ] Post on LinkedIn
- [ ] Create Twitter thread

### Long-term (1-7 days)
- [ ] Monitor rankings
- [ ] Check AI citations
- [ ] Update internal links
- [ ] Repurpose content

## Content Repurposing

| Original | Repurpose |
|----------|-----------|
| Blog post | Twitter thread |
| Blog post | LinkedIn article |
| Blog post | Newsletter section |
| Blog post | YouTube script |
| Blog post | Podcast episode |
| Blog post | Infographic |

## Analytics Integration

```javascript
// GA4 Events
 gtag('event', 'blog_view', {
  'post_title': title,
  'post_category': category,
  'post_author': 'Bonzo'
});

gtag('event', 'lead_magnet_download', {
  'magnet_name': magnetName,
  'post_source': postSlug
});
```
