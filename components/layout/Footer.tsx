'use client'

import { useEffect } from 'react'

interface ExternalLink {
  key: string
  label: string
  href: string
  shortcut: string
}

const EXTERNAL_LINKS: ExternalLink[] = [
  {
    key: 'g',
    label: 'GitHub',
    shortcut: 'G',
    href: 'https://github.com/yatharthmishra',
  },
  {
    key: 'l',
    label: 'LinkedIn',
    shortcut: 'L',
    href: 'https://linkedin.com/in/yatharthmishra',
  },
  {
    key: 't',
    label: 'Twitter',
    shortcut: 'T',
    href: 'https://twitter.com/yatharthmishra',
  },
]

export default function Footer() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable) {
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const link = EXTERNAL_LINKS.find((l) => l.key === e.key.toLowerCase())
      if (link) {
        window.open(link.href, '_blank', 'noopener,noreferrer')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <footer
      className="w-full border-t"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--bg)',
      }}
      aria-label="Site footer"
    >
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        {/* Left: site label */}
        <span>/yatharthmishra.dev</span>

        {/* Center: external links */}
        <div className="flex items-center gap-4">
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors duration-150 hover:text-white"
              style={{ color: 'var(--text-muted)' }}
              aria-label={`${link.label} (keyboard shortcut: ${link.shortcut})`}
            >
              <span style={{ color: 'var(--border)' }}>[{link.shortcut}]</span>
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        {/* Right: year */}
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
