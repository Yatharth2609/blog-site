'use client'

import { useTypewriter } from '@/hooks/useTypewriter'
import TerminalCursor from '@/components/ui/TerminalCursor'
import { motion } from 'framer-motion'

const TAGLINE = 'Building production AI agents, GenAI systems & cloud infrastructure.'

export default function Hero() {
  const { displayed, isDone } = useTypewriter(TAGLINE, 38, 600)

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '420px' }}
      aria-label="Hero section"
    >
      {/* Dot grid background */}
      <div className="dot-grid-bg absolute inset-0 opacity-40" aria-hidden="true" />

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--bg))',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Role label */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs mb-5 tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          AI / Backend Engineer · Capgemini
        </motion.p>

        {/* Name + blinking cursor */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="flex items-center gap-3 mb-6"
        >
          <h1
            className="font-medium leading-tight"
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-geist-mono)',
            }}
          >
            Yatharth Mishra
          </h1>
          <TerminalCursor className="text-3xl sm:text-4xl" />
        </motion.div>

        {/* Typing tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="min-h-[28px]"
        >
          <p
            className="text-sm sm:text-base max-w-2xl leading-relaxed"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
            aria-label={TAGLINE}
          >
            {displayed}
            {/* Show cursor while typing; after done it stays from the name */}
            {!isDone && (
              <span
                style={{
                  color: 'var(--accent)',
                  animation: 'blink 1s step-end infinite',
                }}
                aria-hidden="true"
              >
                ▋
              </span>
            )}
          </p>
        </motion.div>

        {/* Quick-links row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
          className="flex items-center gap-6 mt-10 text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {[
            { label: 'Blog', href: '/blog' },
            { label: 'Search', href: '/search' },
            { label: 'About', href: '/about' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors duration-150 hover:text-white flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <span style={{ color: 'var(--accent)' }}>→</span> {link.label}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
