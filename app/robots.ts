/**
 * app/robots.ts
 *
 * robots.txt — permits all crawlers on all public routes,
 * disallows /api/ endpoints, and links to the sitemap.
 * Served at /robots.txt by Next.js automatically.
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: 'https://blogs.yatharthmishra.dev/sitemap.xml',
  }
}
