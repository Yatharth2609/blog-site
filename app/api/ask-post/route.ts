/**
 * app/api/ask-post/route.ts
 *
 * POST /api/ask-post
 * Body (AI SDK v6 DefaultChatTransport format):
 *   { slug, id, messages: UIMessage[], trigger, messageId }
 *
 * UIMessage has parts: Array<{ type, text?, ... }>
 * We convert to ModelMessage[] for streamText.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { getPostBySlug } from '@/lib/posts'
import type { NextRequest } from 'next/server'

// ─── Strip MDX to clean plain text ───────────────────────────────────────────

function extractText(raw: string): string {
  return raw
    .replace(/^---[\s\S]*?---\s*\n/, '')         // frontmatter
    .replace(/```[\s\S]*?```/g, '[code block]')   // fenced code → hint
    .replace(/`([^`]+)`/g, '$1')                 // inline code → text
    .replace(/^\s*#{1,6}\s+(.+)$/gm, '$1')       // headings → plain
    .replace(/[*_~]+([^*_~]+)[*_~]+/g, '$1')    // bold / italic
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')     // links → label
    .replace(/^[-*+]\s+/gm, '• ')               // bullets
    .replace(/^\d+\.\s+/gm, '')                 // ordered list
    .replace(/^>\s+/gm, '')                      // blockquotes
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 14_000)
}



export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      slug: string
      id?: string
      messages: UIMessage[]
      trigger?: string
      messageId?: string
    }

    const { slug, messages: uiMessages } = body

    if (!slug || !Array.isArray(uiMessages)) {
      return new Response('Bad request: missing slug or messages', { status: 400 })
    }

    // ── Post metadata ────────────────────────────────────────────────────────
    const post = getPostBySlug(slug)
    if (!post) {
      return new Response(`Post "${slug}" not found`, { status: 404 })
    }

    // ── Article text ─────────────────────────────────────────────────────────
    const mdxPath = join(process.cwd(), 'content', 'posts', `${slug}.mdx`)
    const rawText = existsSync(mdxPath)
      ? extractText(readFileSync(mdxPath, 'utf-8'))
      : `${post.title}\n\n${post.summary}`

    // ── System prompt ─────────────────────────────────────────────────────────
    const system = `\
You are a reading assistant embedded in a blog post titled "${post.title}".

Rules:
1. Answer ONLY using information from the article text below.
2. Be concise — 2-4 sentences is ideal unless a list is clearer.
3. Quote or paraphrase directly from the article when relevant.
4. If the answer is NOT in the article, say exactly:
   "That's not covered in this post — try the full blog at blog.yatharthmishra.dev."
5. Do not make up facts. Do not answer off-topic questions.
6. No markdown formatting — use plain conversational prose.

<article>
${rawText}
</article>`

    // ── Convert messages ──────────────────────────────────────────────────────
    // convertToModelMessages is async in AI SDK v6 (may fetch file URLs)
    const modelMessages = await convertToModelMessages(uiMessages)

    // ── Stream via Gemini 2.5 Flash ───────────────────────────────────────────
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY ?? '',
    })

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system,
      messages: modelMessages,
      maxOutputTokens: 500,
    })

    // Return using the v6 UIMessage stream format that the client expects
    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('[/api/ask-post]', err)
    return new Response(String(err), { status: 500 })
  }
}
