import Link from 'next/link'
import { type Post, formatDate } from '@/lib/posts'

interface PostCardProps {
  post: Post
}

/**
 * Data-row style post card for feed lists.
 * Format: 2025.04.20  /  Post Title  /  Engineering  →
 */
export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="feed-row block px-3 py-3.5 -mx-3 rounded-sm"
      aria-label={`${post.title}, ${post.type}, ${post.readingTime} minute read`}
    >
      <div className="flex items-baseline gap-0 text-sm" style={{ fontFamily: 'var(--font-geist-mono)' }}>
        {/* Date */}
        <span
          className="shrink-0 w-28 text-xs"
          style={{ color: 'var(--text-muted)' }}
          aria-label={`Published ${formatDate(post.date)}`}
        >
          {formatDate(post.date)}
        </span>

        {/* Separator */}
        <span className="mx-2 text-xs" style={{ color: 'var(--border)' }} aria-hidden="true">
          /
        </span>

        {/* Title — with slide-in underline on hover */}
        <span className="post-title-link flex-1 min-w-0 truncate" style={{ color: 'var(--text-primary)' }}>
          {post.title}
        </span>

        {/* Separator */}
        <span className="mx-2 text-xs hidden sm:block" style={{ color: 'var(--border)' }} aria-hidden="true">
          /
        </span>

        {/* Type */}
        <span
          className="shrink-0 text-xs hidden sm:block"
          style={{ color: 'var(--text-muted)', minWidth: '90px', textAlign: 'right' }}
        >
          {post.type}
        </span>

        {/* Arrow */}
        <span
          className="ml-3 shrink-0 text-xs"
          style={{ color: 'var(--accent)' }}
          aria-hidden="true"
        >
          →
        </span>
      </div>

      {/* Optional TL;DR subtitle (first 120 chars) */}
      {post.tldr && (
        <p
          className="mt-1 text-xs truncate pl-[calc(7rem+16px)]"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {post.tldr.slice(0, 120)}
        </p>
      )}
    </Link>
  )
}
