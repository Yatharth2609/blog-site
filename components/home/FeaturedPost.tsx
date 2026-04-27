import Link from 'next/link'
import { type Post, formatDate } from '@/lib/posts'
import Tag from '@/components/ui/Tag'

interface FeaturedPostProps {
  post: Post
  figureNumber?: number
}

export default function FeaturedPost({ post, figureNumber = 1 }: FeaturedPostProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block group"
      aria-label={`Featured post: ${post.title}`}
    >
      <article
        className="relative p-6 rounded-sm transition-all duration-200"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Hover accent border overlay */}
        <div
          className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ border: '1px solid var(--accent)' }}
          aria-hidden="true"
        />

        {/* Figure number header */}
        <div className="flex items-center justify-between mb-5">
          <span
            className="text-xs"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.08em',
            }}
          >
            [ Fig. {figureNumber} ]
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
          >
            {formatDate(post.date)}
          </span>
        </div>

        {/* Post type + reading time */}
        <p
          className="text-xs mb-3"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {post.type} · {post.readingTime} min read
        </p>

        {/* Title */}
        <h2
          className="font-medium mb-3 leading-snug transition-colors duration-150 group-hover:text-white"
          style={{
            fontSize: '18px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-geist-mono)',
          }}
        >
          {post.title}
        </h2>

        {/* Summary */}
        <p
          className="text-sm mb-5 leading-relaxed"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {post.summary}
        </p>

        {/* Tags + arrow */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
          <span
            className="text-sm transition-transform duration-150 group-hover:translate-x-1"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
