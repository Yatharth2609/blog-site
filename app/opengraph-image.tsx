/**
 * app/opengraph-image.tsx
 *
 * Homepage Open Graph image — generated at build time.
 * Rendered as a dark terminal-aesthetic card with site branding.
 * Next.js automatically injects: <meta property="og:image" content="..." />
 */

import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Yatharth Mishra — AI Engineering Blog'

export default async function Image() {
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
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top: site label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#4ade80',
            fontSize: 18,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ color: '#4ade80', fontSize: 22 }}>▸</span>
          blogs.yatharthmishra.dev
        </div>

        {/* Middle: name + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              color: '#f5f5f5',
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            Yatharth Mishra
          </div>
          <div
            style={{
              color: '#4ade80',
              fontSize: 26,
              fontWeight: 400,
              letterSpacing: 1,
            }}
          >
            AI Engineer · LangGraph · GCP · Production Agents
          </div>
          <div
            style={{
              color: '#71717a',
              fontSize: 20,
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            Writing about building AI systems that actually work in production.
          </div>
        </div>

        {/* Bottom: metadata bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#52525b',
            fontSize: 18,
            borderTop: '1px solid #27272a',
            paddingTop: '20px',
          }}
        >
          <span>Yatharth Mishra · @yatharth_m2609</span>
          <span style={{ color: '#4ade80' }}>AI / Backend Engineer · Capgemini</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
