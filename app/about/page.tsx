'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import Tag from '@/components/ui/Tag'
import { useTerminalSequence, type TerminalBlock } from '@/hooks/useTerminalSequence'

// ─── Terminal script ─────────────────────────────────────────────────────────

const TERMINAL_BLOCKS: TerminalBlock[] = [
  {
    command: 'whoami',
    output: ['Yatharth Mishra  //  AI Full Stack Engineer'],
  },
  {
    command: 'cat location.txt',
    output: ['Navi Mumbai, Maharashtra, India  →  On-Site'],
  },
  {
    command: 'cat role.txt',
    output: [
      'Software Engineer @ Capgemini',
      'Python backend engineer with 1+ year of production experience building and deploying FastAPI services, GenAI systems, and CI/CD pipelines on cloud infrastructure. AWS Certified with hands-on ownership across RESTful APIs, async workflows, Redis caching, structured logging, and observability.',
    ],
  },
  {
    command: 'ls stack/',
    output: [
      '── languages    Python  SQL  TypeScript  JavaScript  Java',
      '── frameworks   FastAPI  Django  Node.js  Express.js  React.js  Next.js',
      '── ai/ml tools  LangChain  LangGraph  LangSmith  TensorFlow  PyTorch',
      '── infra  GCP  Cloud Run  MongoDB  Redis  AWS  Docker  Terraform (Basics)  CI/CD',
      '── databases/dev tools  PostgreSQL  MongoDB  SQL Server  Git/GitHub  Linux  Postman',
    ],
  },
  {
    command: 'cat interests.txt',
    output: [
      '→  Building python backend servers',
      '→  Agentic AI systems & multi-agent coordination',
      '→  LLM observability & cost optimisation',
      '→  GenAI product engineering at scale',
      '→  Technical writing on AI/Backend',
    ],
  },
  {
    command: 'cat timeline.log | tail -4',
    output: [
      '2025  B.Tech in Computer Science and Engineering @ GLA University',
      '2025  Full Stack developer intern @ Moneyy.ai',
      '2025  Software Engineer - AI @ Capgemini',
      '2025  Tech Lead for GenAI Agentic Platform',
      '2026  Built multi-agent supervisor (12s → 1.8s latency)',
      '2026  blog.yatharthmishra.dev ←── you are here',
    ],
  },
  {
    command: 'cat contact.txt',
    output: [
      'github   →  github.com/Yatharth2609',
      'linkedin →  linkedin.com/in/yatharth-mishra2609',
      'email    →  yatharth.mishra2002@gmail.com',
    ],
  },
  {
    command: 'echo "Thanks for reading."',
    output: ['Thanks for reading.'],
  },
]

// ─── Blinking cursor ─────────────────────────────────────────────────────────

function Cursor({ active }: { active: boolean }) {
  return (
    <motion.span
      animate={{ opacity: active ? [1, 0, 1] : 0 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: '8px',
        height: '13px',
        backgroundColor: 'var(--accent)',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
      }}
    />
  )
}

// ─── Single rendered line ─────────────────────────────────────────────────────

function TerminalLine({
  type,
  text,
  isLast,
  isComplete,
}: {
  type: 'cmd' | 'output' | 'blank'
  text: string
  isLast: boolean
  isComplete: boolean
}) {
  if (type === 'blank') return <div className="h-3" aria-hidden="true" />

  const isCmd = type === 'cmd'
  const showCursor = isLast && !isComplete && isCmd

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.07 }}
      className="flex items-baseline gap-0 leading-[1.7]"
      aria-label={isCmd ? `Command: ${text.replace(/^\$ /, '')}` : undefined}
    >
      <span
        style={{
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '13px',
          color: isCmd ? 'var(--accent)' : 'var(--text-terminal)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {text}
      </span>
      {showCursor && <Cursor active />}
    </motion.div>
  )
}

// ─── After-terminal info cards ────────────────────────────────────────────────

const STACK_GROUPS = [
  { label: '/Languages', items: ['Python', 'TypeScript', 'SQL', 'Bash'] },
  { label: '/Frameworks', items: ['LangGraph', 'FastAPI', 'Next.js', 'React'] },
  { label: '/Infra', items: ['GCP', 'Cloud Run', 'MongoDB', 'Redis', 'Docker'] },
  { label: '/AI', items: ['Claude', 'Gemini', 'GPT-4o', 'Vertex AI', 'LangChain'] },
]

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/yatharthmishra', prefix: 'gh' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/yatharthmishra', prefix: 'li' },
  { label: 'Email', href: 'mailto:yatharth.a.mishra@gmail.com', prefix: 'em' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { visibleLines, isComplete } = useTerminalSequence(TERMINAL_BLOCKS, {
    cmdSpeed: 30,
    cmdPause: 160,
    outputLineDelay: 70,
    blockDelay: 380,
    startDelay: 400,
  })

  // Auto-scroll terminal to bottom as lines appear
  const terminalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    terminalRef.current?.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' })
  }, [visibleLines.length])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

      {/* ── Page header ── */}
      <div className="mb-10">
        <SectionLabel label="About" />
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
          Yatharth Mishra — AI Full Stack Engineer
        </p>
      </div>

      {/* ── Terminal window ── */}
      <div
        className="rounded-sm overflow-hidden mb-12"
        style={{ border: '1px solid var(--border)', backgroundColor: '#0d0d0d' }}
        role="log"
        aria-label="Terminal about session"
        aria-live="polite"
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" aria-hidden="true" />
          <span
            className="ml-3 text-xs"
            style={{ color: 'var(--text-terminal)', fontFamily: 'var(--font-geist-mono)' }}
          >
            yatharth@dev:~
          </span>
          {isComplete && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="ml-auto text-xs"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
            >
              ✓ done
            </motion.span>
          )}
        </div>

        {/* Terminal body — scrollable, max height 420px */}
        <div
          ref={terminalRef}
          className="overflow-y-auto px-4 py-4"
          style={{ maxHeight: '420px', scrollbarWidth: 'thin' }}
        >
          {visibleLines.map((line, i) => {
            const isLast = i === visibleLines.length - 1
            return (
              <TerminalLine
                key={i}
                type={line.type}
                text={line.text}
                isLast={isLast}
                isComplete={isComplete}
              />
            )
          })}

          {/* Final blink after complete */}
          {isComplete && (
            <div className="flex items-baseline mt-0.5">
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)', fontSize: '13px' }}>
                $&nbsp;
              </span>
              <Cursor active />
            </div>
          )}
        </div>
      </div>

      {/* ── Info sections (fade in after terminal completes) ── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-12"
          >

            {/* Stack */}
            <section aria-labelledby="stack-heading">
              <SectionLabel label="Stack" />
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {STACK_GROUPS.map(group => (
                  <div
                    key={group.label}
                    className="rounded-sm p-4"
                    style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p
                      className="text-xs mb-3"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
                      id={`stack-${group.label}`}
                    >
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5" aria-labelledby={`stack-${group.label}`}>
                      {group.items.map(item => <Tag key={item} label={item} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline */}
            <section aria-labelledby="timeline-heading">
              <SectionLabel label="Timeline" />
              <div className="mt-5 space-y-0">
                {[
                  { year: '2022', event: 'B.Tech, Computer Science — Lovely Professional University' },
                  { year: '2023', event: 'Software Engineer @ Capgemini — AI Platform Team' },
                  { year: '2024', event: 'Led GenAI Agentic Platform development — LangGraph + GCP' },
                  { year: '2025', event: 'Multi-agent supervisor: latency 12s → 1.8s (−85%)' },
                  { year: '2025', event: 'blog.yatharthmishra.dev — writing in public' },
                ].map(({ year, event }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="flex gap-4 py-3 border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span
                      className="text-xs shrink-0 w-10 pt-0.5"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {year}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {event}
                    </span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Currently */}
            <section aria-labelledby="currently-heading">
              <SectionLabel label="Currently" />
              <div className="mt-5 space-y-2">
                {[
                  'Building production observability for GenAI platform',
                  'Exploring the agentic AI product space',
                  'Writing technical deep-dives on AI engineering',
                  'Open to senior AI/backend engineering roles',
                ].map((item, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="text-sm flex items-start gap-2"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>›</span>
                    {item}
                  </motion.p>
                ))}
              </div>
            </section>

            {/* Links */}
            <section aria-labelledby="links-heading">
              <SectionLabel label="Links" />
              <div className="mt-5 flex flex-wrap gap-3">
                {LINKS.map(({ label, href, prefix }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group flex items-center gap-2 px-3 py-2 rounded-sm text-xs transition-all duration-150"
                    style={{
                      fontFamily: 'var(--font-geist-mono)',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                    aria-label={`${label} profile`}
                  >
                    <span style={{ color: 'var(--accent)' }}>[{prefix}]</span>
                    <span className="group-hover:text-white transition-colors duration-150">{label}</span>
                    <span style={{ color: 'var(--accent)' }} aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                Read the blog for the technical deep-dives.
              </p>
              <Link
                href="/blog"
                className="text-xs flex items-center gap-1.5 transition-colors duration-150 hover:text-white"
                style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
                aria-label="Go to blog"
              >
                /blog <span aria-hidden="true">→</span>
              </Link>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
