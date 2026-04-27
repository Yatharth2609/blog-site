'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/blog/PostCard'
import TagFilter from '@/components/blog/TagFilter'
import SectionLabel from '@/components/ui/SectionLabel'
import NewsletterForm from '@/components/ui/NewsletterForm'
import { getAllPosts, getAllTags, type Post, type PostType } from '@/lib/posts'

// Data fetched at module level (server data for client component)
const ALL_POSTS = getAllPosts()
const ALL_TAGS = getAllTags()

export default function BlogPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<PostType | null>(null)

  function handleTagToggle(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleTypeToggle(type: PostType) {
    setSelectedType((prev) => (prev === type ? null : type))
  }

  function handleClear() {
    setSelectedTags([])
    setSelectedType(null)
  }

  const filteredPosts = useMemo<Post[]>(() => {
    return ALL_POSTS.filter((post) => {
      const typeMatch = !selectedType || post.type === selectedType
      const tagsMatch =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => post.tags.includes(tag))
      return typeMatch && tagsMatch
    })
  }, [selectedTags, selectedType])

  // Group posts by year
  const grouped = useMemo(() => {
    const map = new Map<string, Post[]>()
    filteredPosts.forEach((post) => {
      const year = post.date.slice(0, 4)
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(post)
    })
    return Array.from(map.entries()).sort((a, b) => Number(b[0]) - Number(a[0]))
  }, [filteredPosts])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

      {/* ── Page header ──────────────────────────── */}
      <div className="mb-12">
        <SectionLabel label="Blog" />
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {ALL_POSTS.length} posts on engineering, AI systems, and the work in between.
        </p>
      </div>

      {/* ── Filter ───────────────────────────────── */}
      <section className="mb-10" aria-label="Post filters">
        <TagFilter
          allTags={ALL_TAGS}
          selectedTags={selectedTags}
          selectedType={selectedType}
          onTagToggle={handleTagToggle}
          onTypeToggle={handleTypeToggle}
          onClear={handleClear}
        />
      </section>

      {/* ── Post list ────────────────────────────── */}
      <section aria-label="Posts list" aria-live="polite" aria-atomic="false">
        {filteredPosts.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm py-12 text-center"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
          >
            No posts match your filters.{' '}
            <button
              onClick={handleClear}
              className="underline"
              style={{ color: 'var(--accent)' }}
            >
              Clear filters
            </button>
          </motion.p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedType ?? 'all'}-${selectedTags.join(',')}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {grouped.map(([year, posts]) => (
                <div key={year} className="mb-10">
                  {/* Year header */}
                  <div
                    className="flex items-center gap-3 mb-4"
                    aria-label={`Posts from ${year}`}
                  >
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {year}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                  </div>

                  {/* Rows */}
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {posts.map((post) => (
                      <PostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* ── Newsletter ────────────────────────────── */}
      <div className="mt-16 pt-10" style={{ borderTop: '1px solid var(--border)' }}>
        <NewsletterForm />
      </div>

    </div>
  )
}
