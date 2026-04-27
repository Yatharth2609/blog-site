'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavItem {
  label: string
  href: string
  key: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', key: 'h' },
  { label: 'Blog', href: '/blog', key: 'b' },
  { label: 'Search', href: '/search', key: 's' },
  { label: 'About', href: '/about', key: 'a' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when focus is inside an input/textarea/contenteditable
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable) {
        return
      }
      // Ignore modifier combos
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const item = NAV_ITEMS.find((n) => n.key === e.key.toLowerCase())
      if (item) {
        router.push(item.href)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav
        className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Site title */}
        <Link
          href="/"
          className="text-sm font-medium tracking-tight"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          YM
        </Link>

        {/* Desktop nav items */}
        <ul className="hidden sm:flex items-center gap-1" role="list">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative flex items-center gap-1 px-2 py-1 text-xs transition-colors duration-150"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-geist-mono)',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Keyboard shortcut bracket label */}
                  <span
                    className="text-xs"
                    style={{
                      color: active ? 'rgba(0,255,135,0.6)' : 'var(--border)',
                    }}
                  >
                    [{item.key.toUpperCase()}]
                  </span>
                  <span>{item.label}</span>
                  {/* Active indicator dot */}
                  {active && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1 p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              backgroundColor: menuOpen ? 'var(--accent)' : 'var(--text-muted)',
              transform: menuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              backgroundColor: menuOpen ? 'var(--accent)' : 'var(--text-muted)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              backgroundColor: menuOpen ? 'var(--accent)' : 'var(--text-muted)',
              transform: menuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
            }}
          />
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div
          className="sm:hidden border-t px-4 py-3 flex flex-col gap-1"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  backgroundColor: active ? 'var(--accent-dim)' : 'transparent',
                  fontFamily: 'var(--font-geist-mono)',
                }}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
                {active && (
                  <span
                    className="w-1.5 h-1.5 rounded-full ml-auto"
                    style={{ backgroundColor: 'var(--accent)' }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}
