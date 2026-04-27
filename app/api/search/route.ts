/**
 * app/api/search/route.ts
 *
 * POST /api/search
 * Body: { query: string }
 * Returns: SearchResult[]
 *
 * Uses Google text-embedding-004 to embed the query, then does
 * cosine similarity against pre-generated data/embeddings.json.
 *
 * Falls back to keyword search when embeddings file doesn't exist.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed } from 'ai'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { rankResults } from '@/lib/search'
import { getAllPosts } from '@/lib/posts'
import type { SearchResult } from '@/lib/search'

const EMBEDDINGS_PATH = join(process.cwd(), 'data', 'embeddings.json')

// ─── Keyword fallback (no embeddings file) ────────────────────────────────────

function keywordSearch(query: string): SearchResult[] {
  const q = query.toLowerCase()
  const words = q.split(/\s+/).filter(Boolean)

  return getAllPosts()
    .map(post => {
      const haystack = [post.title, post.summary, post.tldr ?? '', ...post.tags]
        .join(' ').toLowerCase()
      const score = words.reduce((acc, w) => acc + (haystack.includes(w) ? 0.2 : 0), 0)
      return { post, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ post, score }) => ({
      slug:        post.slug,
      title:       post.title,
      date:        post.date,
      type:        post.type,
      tags:        post.tags,
      summary:     post.summary,
      excerpt:     post.summary.slice(0, 200),
      readingTime: post.readingTime,
      score:       Math.min(score, 0.95),
    }))
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { query?: string }
    const query = (body.query ?? '').trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], mode: 'empty' })
    }

    // ── No embeddings file → keyword fallback ──────────────────────────────
    if (!existsSync(EMBEDDINGS_PATH)) {
      const results = keywordSearch(query)
      return NextResponse.json({ results, mode: 'keyword' })
    }

    // ── Semantic search via Gemini text-embedding-004 ──────────────────────
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY not configured' },
        { status: 503 }
      )
    }

    const google = createGoogleGenerativeAI({ apiKey })
    const model  = google.textEmbeddingModel('gemini-embedding-001')

    const { embedding } = await embed({ model, value: query })

    const embeddings = JSON.parse(readFileSync(EMBEDDINGS_PATH, 'utf-8')) as Record<string, number[]>
    const results    = rankResults(embedding, embeddings, query)

    return NextResponse.json({ results, mode: 'semantic' })
  } catch (err) {
    console.error('[/api/search]', err)
    return NextResponse.json(
      { error: 'Search failed', details: String(err) },
      { status: 500 }
    )
  }
}
