'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function NewsletterForm() {
  const [email,   setEmail]   = useState('')
  const [state,   setState]   = useState<State>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || state === 'loading') return

    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json() as { message?: string; error?: string }

      if (!res.ok) throw new Error(data.error ?? 'Subscribe failed')
      setMessage(data.message ?? 'Subscribed!')
      setState('success')
      setEmail('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
      setState('error')
    }
  }

  return (
    <div
      className="rounded-sm p-6"
      style={{
        backgroundColor: 'var(--surface)',
        border:          '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <p
          className="text-xs mb-1"
          style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
        >
          / newsletter
        </p>
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}
        >
          Get new posts by email
        </h3>
        <p
          className="text-xs mt-1"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          No spam. No cadence goals. Just the good stuff.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
          >
            ✦ {message}
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submit}
            className="flex gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
              placeholder="your@email.com"
              required
              disabled={state === 'loading'}
              className="flex-1 px-3 py-2 text-xs rounded-sm outline-none transition-colors duration-150 disabled:opacity-50"
              style={{
                fontFamily:      'var(--font-geist-mono)',
                backgroundColor: 'var(--bg)',
                border:          state === 'error' ? '1px solid rgba(255,80,80,0.6)' : '1px solid var(--border)',
                color:           'var(--text-primary)',
              }}
              onFocus={e  => (e.target.style.borderColor = 'rgba(0,255,135,0.4)')}
              onBlur={e   => (e.target.style.borderColor = state === 'error' ? 'rgba(255,80,80,0.6)' : 'var(--border)')}
              aria-label="Email address"
              id="newsletter-email"
            />
            <button
              type="submit"
              disabled={state === 'loading' || !email.trim()}
              className="px-4 py-2 rounded-sm text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              style={{
                fontFamily:      'var(--font-geist-mono)',
                backgroundColor: 'var(--accent)',
                color:           '#000',
              }}
              aria-label="Subscribe to newsletter"
            >
              {state === 'loading' ? '…' : 'Subscribe'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Inline error message */}
      {state === 'error' && (
        <p
          className="mt-2 text-xs"
          style={{ color: 'rgba(255,80,80,0.8)', fontFamily: 'var(--font-geist-mono)' }}
        >
          ✕ {message}
        </p>
      )}
    </div>
  )
}
