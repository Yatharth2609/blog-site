interface TagProps {
  label: string
  className?: string
}

export default function Tag({ label, className = '' }: TagProps) {
  return (
    <span className={`tag-pill ${className}`} aria-label={`Tag: ${label}`}>
      {label}
    </span>
  )
}
