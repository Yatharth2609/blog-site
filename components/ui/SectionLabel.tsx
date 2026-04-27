interface SectionLabelProps {
  label: string
  className?: string
}

export default function SectionLabel({ label, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`text-xs font-medium tracking-widest uppercase ${className}`}
      style={{
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-geist-mono)',
        letterSpacing: '0.12em',
      }}
      aria-label={label}
    >
      /{label}
    </span>
  )
}
