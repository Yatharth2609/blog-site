import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReadingProgress from '@/components/blog/ReadingProgress'
import PostHeader from '@/components/blog/PostHeader'
import AskPanel from '@/components/post/AskPanel'
import { getAllPosts, getPostBySlug, getAdjacentPosts, formatDate } from '@/lib/posts'

// Pre-render all post slugs at build time
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

// Allow on-demand rendering for slugs not in generateStaticParams
export const dynamicParams = true

// Dynamic metadata per post
export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  }
}

export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const post = getPostBySlug(slug)

  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(slug)

  // Try to dynamically import the MDX file (available after Velite runs)
  // Falls back to the text-body renderer for mock data
  let MDXContent: React.ComponentType | null = null
  try {
    const mod = await import(`@/content/posts/${slug}.mdx`)
    MDXContent = mod.default ?? null
  } catch {
    // MDX file doesn't exist yet (before Phase 3 build) — use text body
    MDXContent = null
  }

  return (
    <>
      {/* Fixed reading progress bar */}
      <ReadingProgress />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <article className="max-w-2xl mx-auto">

        {/* ── Post header: date, title, tags, TL;DR ── */}
        <PostHeader post={post} />

        <div className="my-8 h-px" style={{ backgroundColor: 'var(--border)' }} />

        {/* ── Post body ── */}
        <div className="mdx-body">
          {MDXContent ? (
            /* Real MDX — rendered with global mdx-components.tsx overrides */
            <MDXContent />
          ) : (
            /* Fallback: plain text body from mock data */
            <div style={{ color: 'var(--text-primary)' }}>
              {post.body.split('\n').map((line, i) => {
                const trimmed = line.trim()
                if (trimmed.startsWith('## ')) {
                  return (
                    <h2 key={i} className="text-lg font-medium mt-10 mb-4 pb-2"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)', borderLeft: '2px solid var(--accent)', paddingLeft: '12px' }}>
                      {trimmed.slice(3)}
                    </h2>
                  )
                }
                if (trimmed.startsWith('```')) {
                  return (
                    <div key={i} className="my-4 rounded-sm p-4"
                      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'var(--font-geist-mono)', fontSize: '13px', color: '#adbac7' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{trimmed.slice(3) || '---'}</span>
                    </div>
                  )
                }
                if (!trimmed) return <div key={i} className="my-3" />
                return (
                  <p key={i} className="text-sm leading-loose mb-4"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}>
                    {trimmed}
                  </p>
                )
              })}
            </div>
          )}
        </div>

        <div className="my-12 h-px" style={{ backgroundColor: 'var(--border)' }} />

        {/* ── Prev / Next navigation ── */}
        <nav className="flex items-start justify-between gap-6" aria-label="Post navigation">
          {prev ? (
            <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1 max-w-xs"
              aria-label={`Previous post: ${prev.title}`}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>← Previous</span>
              <span className="text-sm font-medium transition-colors duration-150 group-hover:text-white"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}>
                {prev.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                {formatDate(prev.date)}
              </span>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={`/blog/${next.slug}`} className="group flex flex-col gap-1 max-w-xs text-right ml-auto"
              aria-label={`Next post: ${next.title}`}>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>Next →</span>
              <span className="text-sm font-medium transition-colors duration-150 group-hover:text-white"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}>
                {next.title}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
                {formatDate(next.date)}
              </span>
            </Link>
          ) : <div />}
        </nav>

        {/* ── Back to blog ── */}
        <div className="mt-10 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/blog"
            className="text-xs transition-colors duration-150 hover:text-white flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}>
            <span style={{ color: 'var(--accent)' }}>←</span> Back to Blog
          </Link>
        </div>

      </article>
      </div>

      {/* ── AI Reading Assistant (client island, fixed bottom-right) ── */}
      <AskPanel slug={slug} postTitle={post.title} />
    </>
  )
}
