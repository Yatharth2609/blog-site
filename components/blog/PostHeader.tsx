import { type Post, formatDate } from '@/lib/posts'
import Tag from '@/components/ui/Tag'

interface PostHeaderProps {
  post: Post
}

export default function PostHeader({ post }: PostHeaderProps) {
  return (
    <header className="mb-10">
      {/* Meta row: date · type · reading time */}
      <div
        className="flex flex-wrap items-center gap-3 text-xs mb-4"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
      >
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden="true">·</span>
        <span>{post.type}</span>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} min read</span>
      </div>

      {/* Title */}
      <h1
        className="font-medium leading-snug mb-5"
        style={{
          fontSize: 'clamp(20px, 4vw, 30px)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-geist-mono)',
        }}
      >
        {post.title}
      </h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>

      {/* TL;DR box */}
      {post.tldr && (
        <div
          className="rounded-sm p-4"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
          role="note"
          aria-label="TL;DR summary"
        >
          <p
            className="text-xs mb-2"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
          >
            /TL;DR
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
          >
            {post.tldr}
          </p>
        </div>
      )}
    </header>
  )
}
