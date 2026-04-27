'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { motion, AnimatePresence } from 'framer-motion'
import type { UIMessage } from 'ai'

interface AskPanelProps {
  slug:      string
  postTitle: string
}

// ─── Extract plain text from a v6 UIMessage ───────────────────────────────────
// In AI SDK v6, message content lives in `parts`, not `content`.
// Each part may be { type: 'text', text: '...' }.

function getMessageText(msg: UIMessage): string {
  if (msg.parts && msg.parts.length > 0) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('')
  }
  // Fallback for any messages that still use the legacy content field
  return (msg as { content?: string }).content ?? ''
}

// ─── Streaming cursor ─────────────────────────────────────────────────────────

function StreamCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
      aria-hidden="true"
      className="inline-block w-1.5 h-3.5 ml-0.5 align-middle"
      style={{ backgroundColor: 'var(--accent)', verticalAlign: 'text-bottom' }}
    />
  )
}

// ─── Individual message bubble ────────────────────────────────────────────────

function MessageBubble({
  msg,
  isStreaming,
}: {
  msg: UIMessage
  isStreaming?: boolean
}) {
  const isUser = msg.role === 'user'
  const text   = getMessageText(msg)
  if (!text && !isStreaming) return null

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="shrink-0 w-5 h-5 rounded-sm flex items-center justify-center text-xs mt-0.5"
          style={{ backgroundColor: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)' }}
          aria-hidden="true"
        >
          <span style={{ color: 'var(--accent)', fontSize: '10px' }}>✦</span>
        </div>
      )}
      <div
        className="max-w-[85%] rounded-sm px-3 py-2 text-xs leading-relaxed"
        style={{
          fontFamily:      'var(--font-geist-mono)',
          backgroundColor: isUser ? 'rgba(0,255,135,0.08)' : 'var(--surface)',
          border:          `1px solid ${isUser ? 'rgba(0,255,135,0.2)' : 'var(--border)'}`,
          color:           isUser ? 'var(--accent)' : 'var(--text-muted)',
          whiteSpace:      'pre-wrap',
        }}
      >
        {text || ''}
        {isStreaming && <StreamCursor />}
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function AskPanel({ slug, postTitle }: AskPanelProps) {
  const [open,  setOpen]  = useState(false)
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  // AI SDK v6: api + body go through DefaultChatTransport
  const { messages, sendMessage, status } = useChat({
    id: `ask-${slug}`,
    transport: new DefaultChatTransport({
      api:  '/api/ask-post',
      body: { slug },
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  // Escape key closes panel
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Submit the current draft
  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const q = draft.trim()
    if (!q || isLoading) return
    sendMessage({ text: q })
    setDraft('')
  }

  // Click an example prompt → populate input and focus
  function tryExample(text: string) {
    setDraft(text)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const examples = [
    'What was the latency before the fix?',
    'Summarise the key takeaway',
    'What tools are used in this post?',
  ]

  const lastMsg          = messages[messages.length - 1]
  const streamingOnLast  = status === 'streaming' && lastMsg?.role === 'assistant'

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-sm text-xs transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          fontFamily:      'var(--font-geist-mono)',
          backgroundColor: open ? 'var(--accent)' : 'var(--surface)',
          border:          '1px solid var(--accent)',
          color:           open ? '#000' : 'var(--accent)',
          boxShadow:       '0 0 16px rgba(0,255,135,0.15)',
        }}
        aria-label={open ? 'Close Ask This Post panel' : 'Ask a question about this post'}
        aria-expanded={open}
        aria-controls="ask-panel"
      >
        <span aria-hidden="true">{open ? '✕' : '[?]'}</span>
        <span className="hidden sm:inline">{open ? 'Close' : 'Ask this post'}</span>
      </button>

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Side panel ── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            id="ask-panel"
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0,      opacity: 1 }}
            exit={{ x: '100%',    opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full z-40 flex flex-col"
            style={{
              width:           'min(100vw, 400px)',
              backgroundColor: '#0a0a0a',
              borderLeft:      '1px solid var(--border)',
            }}
            aria-label="Ask This Post reading assistant"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-3 p-4 border-b shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-sm"
                    style={{
                      fontFamily:      'var(--font-geist-mono)',
                      color:           'var(--accent)',
                      backgroundColor: 'rgba(0,255,135,0.08)',
                      border:          '1px solid rgba(0,255,135,0.2)',
                    }}
                  >
                    ✦ Ask This Post
                  </span>
                </div>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                  title={postTitle}
                >
                  {postTitle}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs px-2 py-1 rounded-sm transition-colors duration-150 hover:text-white"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ scrollbarWidth: 'thin' }}
              aria-live="polite"
              aria-label="Conversation"
            >
              {/* Empty state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <p
                    className="text-xs text-center"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                  >
                    Ask anything about this post.
                    <br />
                    <span style={{ color: 'var(--border)' }}>Answers come only from the article.</span>
                  </p>
                  <div className="space-y-2">
                    {examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => tryExample(ex)}
                        className="w-full text-left text-xs px-3 py-2 rounded-sm transition-all duration-150"
                        style={{
                          fontFamily:      'var(--font-geist-mono)',
                          color:           'var(--text-muted)',
                          backgroundColor: 'var(--surface)',
                          border:          '1px solid var(--border)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <span style={{ color: 'var(--accent)', marginRight: '6px' }}>›</span>
                        {ex}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Chat messages */}
              {messages.map((msg, i) => {
                const isLast      = i === messages.length - 1
                const isStreaming = isLast && streamingOnLast
                return (
                  <MessageBubble key={msg.id} msg={msg} isStreaming={isStreaming} />
                )
              })}

              {/* "thinking…" pulse while waiting for first token */}
              {status === 'submitted' && (
                <div className="flex gap-2 justify-start">
                  <div
                    className="shrink-0 w-5 h-5 rounded-sm flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.25)' }}
                    aria-hidden="true"
                  >
                    <span style={{ color: 'var(--accent)', fontSize: '10px' }}>✦</span>
                  </div>
                  <div
                    className="px-3 py-2 rounded-sm text-xs"
                    style={{
                      fontFamily:      'var(--font-geist-mono)',
                      backgroundColor: 'var(--surface)',
                      border:          '1px solid var(--border)',
                      color:           'var(--text-muted)',
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      thinking…
                    </motion.span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={submit}
              className="p-4 border-t shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Ask about this post…"
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-sm text-xs outline-none transition-colors duration-150 disabled:opacity-50"
                  style={{
                    fontFamily:      'var(--font-geist-mono)',
                    backgroundColor: 'var(--surface)',
                    border:          '1px solid var(--border)',
                    color:           'var(--text-primary)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,255,135,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                  aria-label="Your question"
                />
                <button
                  type="submit"
                  disabled={isLoading || !draft.trim()}
                  className="px-3 py-2 rounded-sm text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    fontFamily:      'var(--font-geist-mono)',
                    backgroundColor: 'var(--accent)',
                    color:           '#000',
                  }}
                  aria-label="Send question"
                >
                  →
                </button>
              </div>
              <p
                className="mt-2 text-center text-xs"
                style={{ color: 'var(--border)', fontFamily: 'var(--font-geist-mono)' }}
              >
                Esc to close · Answers scoped to this article
              </p>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
