import type { Metadata } from 'next'
import Link from 'next/link'
import Hero from '@/components/home/Hero'
import FeaturedPost from '@/components/home/FeaturedPost'
import PostCard from '@/components/blog/PostCard'
import SectionLabel from '@/components/ui/SectionLabel'
import { getFeaturedPost, getRecentPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Yatharth Mishra',
  description: 'AI Engineer writing about LangGraph, production agents, and GCP.',
}

export default function HomePage() {
  const featuredPost = getFeaturedPost()
  const recentPosts = getRecentPosts(5)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Hero />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* ── [ Fig. 1 ] Featured Post ─────────────────────────────── */}
        {featuredPost && (
          <section aria-labelledby="featured-heading">
            <div className="flex items-center gap-4 mb-6">
              <SectionLabel label="Featured" />
              <span
                className="text-xs"
                style={{ color: 'var(--border)', fontFamily: 'var(--font-geist-mono)' }}
                aria-hidden="true"
              >
                ──────────────
              </span>
            </div>
            <h2 id="featured-heading" className="sr-only">Featured Post</h2>
            <FeaturedPost post={featuredPost} figureNumber={1} />
          </section>
        )}

        {/* ── Recent Posts ─────────────────────────────────────────── */}
        <section aria-labelledby="recent-heading">
          <div className="flex items-center justify-between mb-6">
            <SectionLabel label="Recent Posts" />
          </div>
          <h2 id="recent-heading" className="sr-only">Recent Posts</h2>

          {/* Divider */}
          <div
            className="mb-2 h-px"
            style={{ backgroundColor: 'var(--border)' }}
            aria-hidden="true"
          />

          {/* Feed rows */}
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* View all link */}
          <div
            className="mt-6 pt-4 border-t flex justify-end"
            style={{ borderColor: 'var(--border)' }}
          >
            <Link
              href="/blog"
              className="text-xs flex items-center gap-1.5 transition-colors duration-150 hover:text-white"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
              aria-label="View all blog posts"
            >
              View all posts
              <span style={{ color: 'var(--accent)' }} aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
