import { type ReactNode } from 'react'

type CalloutType = 'info' | 'warning' | 'note' | 'tip'

interface CalloutProps {
  type?: CalloutType
  children: ReactNode
  title?: string
}

const CALLOUT_CONFIG: Record<CalloutType, {
  icon: string
  label: string
  borderColor: string
  bgColor: string
  iconColor: string
}> = {
  info: {
    icon: 'ℹ',
    label: 'Info',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    bgColor: 'rgba(59, 130, 246, 0.06)',
    iconColor: '#60a5fa',
  },
  warning: {
    icon: '⚠',
    label: 'Warning',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    bgColor: 'rgba(234, 179, 8, 0.06)',
    iconColor: '#fbbf24',
  },
  note: {
    icon: '◆',
    label: 'Note',
    borderColor: 'rgba(0, 255, 135, 0.3)',
    bgColor: 'rgba(0, 255, 135, 0.04)',
    iconColor: 'var(--accent)',
  },
  tip: {
    icon: '→',
    label: 'Tip',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    bgColor: 'rgba(168, 85, 247, 0.06)',
    iconColor: '#c084fc',
  },
}

export default function Callout({ type = 'note', children, title }: CalloutProps) {
  const config = CALLOUT_CONFIG[type]

  return (
    <div
      className="my-6 rounded-sm px-4 py-4"
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderLeft: `3px solid ${config.borderColor}`,
      }}
      role="note"
      aria-label={`${config.label}: ${title ?? ''}`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-sm"
          style={{ color: config.iconColor, fontFamily: 'var(--font-geist-mono)' }}
          aria-hidden="true"
        >
          {config.icon}
        </span>
        <span
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: config.iconColor, fontFamily: 'var(--font-geist-mono)' }}
        >
          {title ?? config.label}
        </span>
      </div>

      {/* Content */}
      <div
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
      >
        {children}
      </div>
    </div>
  )
}
