/**
 * lib/search.ts
 *
 * Semantic search utilities:
 * - Cosine similarity
 * - Excerpt extraction (best matching window in body text)
 * - Post text serialisation for embedding
 */

import { getAllPosts, type Post } from './posts'

export interface SearchResult {
  slug: string
  title: string
  date: string
  type: string
  tags: string[]
  summary: string
  excerpt: string       // best 200-char window from body
  readingTime: number
  score: number         // cosine similarity [0, 1]
}

// ─── Cosine similarity ────────────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

// ─── Text serialisation ───────────────────────────────────────────────────────

/**
 * Build a single string representing a post for embedding.
 * Includes title, type, tags, summary, tldr, and body (stripped of markdown).
 */
export function postToText(post: Post): string {
  const clean = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, '')   // strip code blocks
    .replace(/`[^`]*`/g, '')          // strip inline code
    .replace(/#{1,6}\s+/g, '')        // strip heading markers
    .replace(/[*_~]/g, '')            // strip emphasis markers
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')  // strip links, keep text
    .replace(/\s+/g, ' ')
    .trim()

  return [
    post.title,
    post.type,
    post.tags.join(' '),
    post.summary,
    post.tldr ?? '',
    clean,
  ].join('\n').slice(0, 8000)  // Gemini embedding input limit
}

// ─── Excerpt extraction ───────────────────────────────────────────────────────

/**
 * Find the 200-char window in the post body most relevant to the query.
 * Falls back to the start of the summary.
 */
export function extractExcerpt(post: Post, query: string): string {
  const text = post.body
    ? post.body
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_~]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : post.summary

  if (!text) return post.summary.slice(0, 200)

  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean)
  const words = text.split(' ')
  const WINDOW = 35  // words in excerpt window

  let bestScore = -1
  let bestStart = 0

  for (let i = 0; i <= words.length - WINDOW; i++) {
    const window = words.slice(i, i + WINDOW).join(' ').toLowerCase()
    const score = queryWords.reduce((acc, w) => acc + (window.includes(w) ? 1 : 0), 0)
    if (score > bestScore) { bestScore = score; bestStart = i }
  }

  const chunk = words.slice(bestStart, bestStart + WINDOW).join(' ')
  const excerpt = (bestStart > 0 ? '…' : '') + chunk + (bestStart + WINDOW < words.length ? '…' : '')
  return excerpt.slice(0, 240)
}

// ─── Rank results ─────────────────────────────────────────────────────────────

export function rankResults(
  queryEmbedding: number[],
  embeddings: Record<string, number[]>,
  query: string,
  topN = 5
): SearchResult[] {
  const posts = getAllPosts()

  const scored = posts
    .filter(p => embeddings[p.slug])
    .map(p => ({
      post: p,
      score: cosineSimilarity(queryEmbedding, embeddings[p.slug]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(r => r.score > 0.3)  // relevance threshold

  return scored.map(({ post, score }) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    type: post.type,
    tags: post.tags,
    summary: post.summary,
    excerpt: extractExcerpt(post, query),
    readingTime: post.readingTime,
    score,
  }))
}
