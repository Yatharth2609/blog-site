interface TerminalCursorProps {
  className?: string
}

export default function TerminalCursor({ className = '' }: TerminalCursorProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{
        color: 'var(--accent)',
        animation: 'blink 1s step-end infinite',
        fontFamily: 'var(--font-geist-mono)',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      ▋
    </span>
  )
}
