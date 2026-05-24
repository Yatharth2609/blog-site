import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReadingProgress from '@/components/blog/ReadingProgress'
import PostHeader from '@/components/blog/PostHeader'
import AskPanel from '@/components/post/AskPanel'
import { JsonLd } from '@/components/JsonLd'
import { getAllPosts, getPostBySlug, getAdjacentPosts, formatDate } from '@/lib/posts'

const BASE = 'https://blogs.yatharthmishra.dev'

// Pre-render all post slugs at build time
export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

// Allow on-demand rendering for slugs not in generateStaticParams
export const dynamicParams = true

// TASK 4: Fully-enriched generateMetadata with Open Graph article fields,
// Twitter card, canonical, authors, and keywords.
export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: `${post.title} | Yatharth Mishra`,
    description: post.summary,
    authors: [{ name: 'Yatharth Mishra', url: 'https://yatharthmishra.dev' }],
    keywords: post.tags,
    // TASK 1: Canonical per-post URL (relative; resolved against metadataBase)
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      // Relative URL — Next.js resolves against metadataBase in root layout
      url: `/blog/${post.slug}`,
      siteName: 'Yatharth Mishra',
      locale: 'en_US',
      publishedTime: post.date,
      // No lastModified in current schema — fall back to date
      modifiedTime: post.date,
      authors: ['Yatharth Mishra'],
      tags: post.tags,
      // NOTE: og:image is automatically injected from opengraph-image.tsx —
      // do NOT manually set `images` here when using file-based OG images.
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      creator: '@yatharth_m2609',
      site: '@yatharth_m2609',
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

  const postUrl = `${BASE}/blog/${post.slug}`

  return (
    <>
      {/* Fixed reading progress bar */}
      <ReadingProgress />

      {/* TASK 3c: BlogPosting schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          dateModified: post.date,
          url: postUrl,
          image: `${postUrl}/opengraph-image`,
          keywords: post.tags?.join(', '),
          author: {
            '@type': 'Person',
            name: 'Yatharth Mishra',
            url: 'https://yatharthmishra.dev',
          },
          publisher: {
            '@type': 'Person',
            name: 'Yatharth Mishra',
            url: 'https://yatharthmishra.dev',
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl,
          },
        }}
      />

      {/* TASK 3d: BreadcrumbList schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: BASE,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: `${BASE}/blog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: postUrl,
            },
          ],
        }}
      />

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
