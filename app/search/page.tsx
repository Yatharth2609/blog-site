'use client'

import { useState, useEffect, useRef, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import SectionLabel from '@/components/ui/SectionLabel'
import Tag from '@/components/ui/Tag'
import { formatDate } from '@/lib/posts'
import type { SearchResult } from '@/lib/search'

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Search state ─────────────────────────────────────────────────────────────

type SearchMode = 'semantic' | 'keyword' | 'empty' | null
type Status     = 'idle' | 'loading' | 'done' | 'error'

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: initialQ = '' } = use(searchParams)
  const router = useRouter()

  const [query,   setQuery]   = useState(initialQ)
  const [results, setResults] = useState<SearchResult[]>([])
  const [mode,    setMode]    = useState<SearchMode>(null)
  const [status,  setStatus]  = useState<Status>('idle')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQ = useDebounce(query, 300)

  // Auto-focus input on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Keyboard: [S] focuses search, Escape clears
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Fetch on debounced query change
  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([])
      setMode(null)
      setStatus('idle')
      return
    }

    setStatus('loading')

    // Update URL bar without navigation
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false })

    try {
      const res  = await fetch('/api/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: q }),
      })
      const data = await res.json() as { results?: SearchResult[]; mode?: SearchMode; error?: string }

      if (!res.ok) throw new Error(data.error ?? 'Search failed')

      setResults(data.results ?? [])
      setMode(data.mode ?? null)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setResults([])
    }
  }, [router])

  useEffect(() => { search(debouncedQ) }, [debouncedQ, search])

  // ─── Dots animation ───────────────────────────────────────────────────────
  const [dots, setDots] = useState('.')
  useEffect(() => {
    if (status !== 'loading') return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(id)
  }, [status])

  const showEmpty  = status === 'done' && results.length === 0
  const showError  = status === 'error'
  const hasResults = status === 'done' && results.length > 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

      {/* ── Page header ── */}
      <div className="mb-10">
        <SectionLabel label="Search" />
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
          Semantic search across all posts.{' '}
          <span style={{ color: 'var(--border)' }}>Press [S] to focus.</span>
        </p>
      </div>

      {/* ── Search input ── */}
      <div className="relative mb-8">
        {/* Slash prefix */}
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm select-none pointer-events-none"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
          aria-hidden="true"
        >
          /
        </span>

        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur() }
          }}
          placeholder="Search posts..."
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-8 pr-4 py-3 rounded-sm text-sm outline-none transition-all duration-200"
          style={{
            fontFamily:      'var(--font-geist-mono)',
            backgroundColor: 'var(--surface)',
            color:           'var(--text-primary)',
            border:          `1px solid ${focused ? 'rgba(0,255,135,0.4)' : 'var(--border)'}`,
            boxShadow:       focused ? '0 0 0 1px rgba(0,255,135,0.15)' : 'none',
          }}
          aria-label="Search posts"
          aria-controls="search-results"
          aria-expanded={hasResults}
        />

        {/* Loading indicator */}
        <AnimatePresence>
          {status === 'loading' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
              aria-live="polite"
            >
              searching{dots}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mode badge ── */}
      <AnimatePresence>
        {mode && mode !== 'empty' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs mb-5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
            aria-live="polite"
          >
            {mode === 'semantic'
              ? `◆ semantic · ${results.length} result${results.length !== 1 ? 's' : ''}`
              : `◇ keyword fallback · ${results.length} result${results.length !== 1 ? 's' : ''}`}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <section id="search-results" aria-label="Search results" aria-live="polite">

        {/* Empty state */}
        <AnimatePresence>
          {showEmpty && (
            <motion.p
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm py-10 text-center"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
            >
              No posts found for &ldquo;{query}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {showError && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm py-10 text-center"
              style={{ color: '#f87171', fontFamily: 'var(--font-geist-mono)' }}
            >
              Search failed — check the console for details.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Idle prompt */}
        <AnimatePresence>
          {status === 'idle' && !query && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10 text-center space-y-2"
            >
              <p className="text-xs" style={{ color: 'var(--border)', fontFamily: 'var(--font-geist-mono)' }}>
                — try: &ldquo;LangGraph latency&rdquo; · &ldquo;Cloud Run cold start&rdquo; · &ldquo;RAG production&rdquo; —
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result list */}
        <AnimatePresence mode="wait">
          {hasResults && (
            <motion.div
              key={query}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y"
              style={{ borderColor: 'var(--border)' }}
            >
              {results.map((result, i) => (
                <SearchResultCard key={result.slug} result={result} rank={i + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </section>
    </div>
  )
}

// ─── Individual result card ───────────────────────────────────────────────────

function SearchResultCard({ result, rank }: { result: SearchResult; rank: number }) {
  const pct = Math.round(result.score * 100)

  return (
    <Link
      href={`/blog/${result.slug}`}
      className="block py-5 group"
      aria-label={`Result ${rank}: ${result.title}`}
    >
      {/* Meta row */}
      <div
        className="flex items-center gap-3 text-xs mb-2"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
      >
        <span>{formatDate(result.date)}</span>
        <span aria-hidden="true">·</span>
        <span>{result.type}</span>
        <span aria-hidden="true">·</span>
        <span>{result.readingTime} min</span>
        {/* Relevance score */}
        <span
          className="ml-auto text-xs px-1.5 py-0.5 rounded-sm"
          style={{
            color:           pct > 70 ? 'var(--accent)' : 'var(--text-muted)',
            backgroundColor: pct > 70 ? 'var(--accent-dim)' : 'transparent',
            border:          `1px solid ${pct > 70 ? 'rgba(0,255,135,0.2)' : 'var(--border)'}`,
            fontFamily:      'var(--font-geist-mono)',
          }}
          aria-label={`${pct}% relevance`}
        >
          {pct}%
        </span>
      </div>

      {/* Title */}
      <h2
        className="text-sm font-medium mb-2 transition-colors duration-150 group-hover:text-white"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}
      >
        {result.title}
      </h2>

      {/* Excerpt */}
      <p
        className="text-xs leading-relaxed mb-3"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
      >
        {result.excerpt}
      </p>

      {/* Tags + arrow */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {result.tags.slice(0, 3).map(tag => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
        <span
          className="text-xs transition-transform duration-150 group-hover:translate-x-1"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </Link>
  )
}
