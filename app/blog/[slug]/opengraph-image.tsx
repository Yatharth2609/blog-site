/**
 * app/blog/[slug]/opengraph-image.tsx
 *
 * Per-post Open Graph image — generated dynamically for each post slug.
 * Next.js automatically injects: <meta property="og:image" content="..." />
 *
 * NOTE: In Next.js 16+, `params` is a Promise — must be awaited.
 */

import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  // Fallback values when post not found
  const title = post?.title ?? 'Blog Post'
  const tags = post?.tags ?? ['Engineering']
  const date = post?.date ?? new Date().toISOString().slice(0, 10)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top: tag + site URL */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span
            style={{
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 4,
              color: '#4ade80',
              fontSize: 16,
              letterSpacing: 2,
              padding: '4px 14px',
              textTransform: 'uppercase',
            }}
          >
            {tags[0] ?? 'ENGINEERING'}
          </span>
          <span style={{ color: '#3f3f46', fontSize: 16 }}>—</span>
          <span style={{ color: '#52525b', fontSize: 16 }}>
            blogs.yatharthmishra.dev
          </span>
        </div>

        {/* Middle: post title */}
        <div
          style={{
            color: '#f5f5f5',
            fontSize: title.length > 50 ? 44 : 52,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 950,
          }}
        >
          {title}
        </div>

        {/* Bottom: author + date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#71717a',
            fontSize: 20,
            borderTop: '1px solid #27272a',
            paddingTop: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(74,222,128,0.15)',
                color: '#4ade80',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Y
            </span>
            <span>Yatharth Mishra · @yatharth_m2609</span>
          </div>
          <span>{date}</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
