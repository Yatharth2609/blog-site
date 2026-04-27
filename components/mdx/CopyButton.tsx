'use client'

import { useState } from 'react'

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded-sm transition-all duration-150"
      style={{
        color: copied ? 'var(--accent)' : 'var(--text-muted)',
        fontFamily: 'var(--font-geist-mono)',
        backgroundColor: 'transparent',
        border: `1px solid ${copied ? 'rgba(0,255,135,0.3)' : 'var(--border)'}`,
      }}
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
