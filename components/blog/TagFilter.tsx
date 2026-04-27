'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type PostType } from '@/lib/posts'

const POST_TYPES: PostType[] = ['Engineering', 'Career', 'Case Study', 'Opinion', 'Random']

interface TagFilterProps {
  allTags: string[]
  selectedTags: string[]
  selectedType: PostType | null
  onTagToggle: (tag: string) => void
  onTypeToggle: (type: PostType) => void
  onClear: () => void
}

export default function TagFilter({
  allTags,
  selectedTags,
  selectedType,
  onTagToggle,
  onTypeToggle,
  onClear,
}: TagFilterProps) {
  const hasFilters = selectedTags.length > 0 || selectedType !== null

  return (
    <div className="space-y-4" role="search" aria-label="Filter posts">
      {/* Type filter */}
      <div>
        <p
          className="text-xs mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
          id="type-filter-label"
        >
          /Type
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="type-filter-label">
          {POST_TYPES.map((type) => {
            const active = selectedType === type
            return (
              <button
                key={type}
                onClick={() => onTypeToggle(type)}
                className="text-xs px-3 py-1 rounded-sm transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  backgroundColor: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'rgba(0,255,135,0.3)' : 'var(--border)'}`,
                }}
                aria-pressed={active}
                aria-label={`Filter by ${type}`}
              >
                {type}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tag filter */}
      <div>
        <p
          className="text-xs mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
          id="tag-filter-label"
        >
          /Tags
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tag-filter-label">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className="text-xs px-2 py-0.5 rounded-sm transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-geist-mono)',
                  backgroundColor: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'rgba(0,255,135,0.25)' : 'var(--border)'}`,
                }}
                aria-pressed={active}
                aria-label={`Filter by tag ${tag}`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear filters */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <button
              onClick={onClear}
              className="text-xs transition-colors duration-150 hover:text-white"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
              aria-label="Clear all filters"
            >
              × Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
