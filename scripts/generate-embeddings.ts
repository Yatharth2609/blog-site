/**
 * scripts/generate-embeddings.ts
 *
 * One-time script to generate and persist post embeddings.
 * Run with: npx tsx scripts/generate-embeddings.ts
 *
 * Requires: GOOGLE_API_KEY in .env.local
 * Output:   data/embeddings.json  (gitignored — regenerate on new posts)
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { embed } from 'ai'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { getAllPosts } from '../lib/posts'
import { postToText } from '../lib/search'

// Load env vars from .env.local (tsx doesn't auto-load them)
import { config } from 'dotenv'
config({ path: join(process.cwd(), '.env.local'), override: true })

// @ai-sdk/google resolves the key from GOOGLE_GENERATIVE_AI_API_KEY internally.
// Our .env.local uses GOOGLE_API_KEY — alias it so both names work.
if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY.trim()
}

async function main() {
  // .env.local on Windows uses CRLF — trim \r so the key isn't corrupted
  const apiKey = process.env.GOOGLE_API_KEY?.trim()
  if (!apiKey) {
    console.error('❌  GOOGLE_API_KEY not found in .env.local')
    process.exit(1)
  }

  const google = createGoogleGenerativeAI({ apiKey })
  const model  = google.textEmbeddingModel('gemini-embedding-001')

  const posts = getAllPosts()
  console.log(`\n🔍  Generating embeddings for ${posts.length} posts...\n`)

  const embeddings: Record<string, number[]> = {}

  for (const post of posts) {
    process.stdout.write(`  → ${post.slug} ... `)
    const text = postToText(post)

    try {
      const { embedding } = await embed({ model, value: text })
      embeddings[post.slug] = embedding
      console.log(`✓  (${embedding.length} dims)`)
    } catch (err) {
      console.log(`✗  ERROR: ${(err as Error).message}`)
    }

    // Rate-limit: 1 request/second for free tier
    await new Promise(r => setTimeout(r, 1100))
  }

  const outDir  = join(process.cwd(), 'data')
  const outFile = join(outDir, 'embeddings.json')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(outFile, JSON.stringify(embeddings, null, 2))

  console.log(`\n✅  Saved embeddings to ${outFile}`)
  console.log(`    Posts embedded: ${Object.keys(embeddings).length} / ${posts.length}\n`)
}

main().catch(err => {
  console.error('\n❌  Fatal error:\n', err)
  process.exit(1)
})
