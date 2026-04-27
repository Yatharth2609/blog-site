import React, { type ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import CodeBlock from '@/components/mdx/CodeBlock'
import Callout from '@/components/mdx/Callout'

// ─── Optimised image for MDX (replaces bare <img> tags and ![alt](src) syntax)
function PostImage({
  src,
  alt,
  title,
}: {
  src?: string
  alt?: string
  title?: string
}) {
  if (!src) return null
  const caption = title || alt

  return (
    <figure className="my-8">
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* next/image requires width/height or fill. Use fill + padding-trick container */}
        <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 */ }}>
          <Image
            src={src}
            alt={alt ?? ''}
            fill
            className="object-contain"
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, 672px"
            loading="lazy"
          />
        </div>
      </div>
      {caption && (
        <figcaption
          className="mt-2 text-center text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-geist-mono)' }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// Custom heading with accent left border on h2/h3
function H1({ children }: { children?: ReactNode }) {
  return (
    <h1
      className="font-medium mt-12 mb-5 leading-snug"
      style={{
        fontSize: 'clamp(20px, 3.5vw, 28px)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
      }}
    >
      {children}
    </h1>
  )
}

function H2({ children }: { children?: ReactNode }) {
  return (
    <h2
      className="font-medium mt-10 mb-4 pb-2 leading-snug"
      style={{
        fontSize: '18px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
        borderLeft: '2px solid var(--accent)',
        paddingLeft: '12px',
      }}
    >
      {children}
    </h2>
  )
}

function H3({ children }: { children?: ReactNode }) {
  return (
    <h3
      className="font-medium mt-8 mb-3 leading-snug"
      style={{
        fontSize: '16px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
        borderLeft: '1px solid rgba(0,255,135,0.4)',
        paddingLeft: '10px',
      }}
    >
      {children}
    </h3>
  )
}

function Paragraph({ children }: { children?: ReactNode }) {
  return (
    <p
      className="mb-5 leading-loose"
      style={{
        fontSize: '14px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
        lineHeight: '1.85',
      }}
    >
      {children}
    </p>
  )
}

function Anchor({ href, children }: { href?: string; children?: ReactNode }) {
  const isExternal = href?.startsWith('http')
  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}
      className="underline-offset-2 hover:opacity-80 transition-opacity duration-150"
    >
      {children}
    </a>
  )
}

function InlineCode({ children }: { children?: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '13px',
        color: 'var(--accent)',
        backgroundColor: 'var(--surface)',
        padding: '1px 5px',
        borderRadius: '3px',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </code>
  )
}

// Pre wraps fenced code blocks — MDX maps ```python to <pre><code className="language-python">
// CodeBlock is an async server component; this wrapper is also a server component (no 'use client')
function Pre({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
  // MDX renders code blocks as: <pre><code className="language-python">...</code></pre>
  const child = children as { props?: { children?: string; className?: string } } | undefined
  const code = child?.props?.children ?? ''
  const className = child?.props?.className ?? ''
  // Extract language from "language-python" → "python"
  const language = className.startsWith('language-')
    ? className.replace('language-', '')
    : 'text'

  // CodeBlock is async — works because mdx-components is also a server module
  return <CodeBlock language={language}>{typeof code === 'string' ? code : String(code)}</CodeBlock>
}

function Blockquote({ children }: { children?: ReactNode }) {
  return (
    <blockquote
      className="my-6 pl-4 italic"
      style={{
        borderLeft: '2px solid var(--accent)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '14px',
      }}
    >
      {children}
    </blockquote>
  )
}

function Hr() {
  return (
    <hr
      className="my-10"
      style={{ borderColor: 'var(--border)', borderTopWidth: '1px' }}
    />
  )
}

function Ul({ children }: { children?: ReactNode }) {
  return (
    <ul
      className="my-4 ml-4 space-y-1.5"
      style={{
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '14px',
        listStyleType: 'none',
      }}
    >
      {children}
    </ul>
  )
}

function Ol({ children }: { children?: ReactNode }) {
  return (
    <ol
      className="my-4 ml-4 space-y-1.5"
      style={{
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-geist-mono)',
        fontSize: '14px',
        listStyleType: 'decimal',
        paddingLeft: '1rem',
      }}
    >
      {children}
    </ol>
  )
}

function Li({ children }: { children?: ReactNode }) {
  return (
    <li
      className="leading-relaxed flex gap-2"
      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-geist-mono)' }}
    >
      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>›</span>
      <span>{children}</span>
    </li>
  )
}

function Table({ children }: { children?: ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table
        className="w-full text-sm"
        style={{
          fontFamily: 'var(--font-geist-mono)',
          borderCollapse: 'collapse',
          color: 'var(--text-primary)',
        }}
      >
        {children}
      </table>
    </div>
  )
}

function Th({ children }: { children?: ReactNode }) {
  return (
    <th
      className="text-left px-3 py-2 text-xs"
      style={{
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-geist-mono)',
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children?: ReactNode }) {
  return (
    <td
      className="px-3 py-2 text-xs"
      style={{
        color: 'var(--text-primary)',
        borderBottom: '1px solid rgba(31,31,31,0.5)',
        fontFamily: 'var(--font-geist-mono)',
      }}
    >
      {children}
    </td>
  )
}

// Global MDX components — applied to all MDX files
const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  a: Anchor,
  code: InlineCode,
  pre: Pre,
  blockquote: Blockquote,
  hr: Hr,
  ul: Ul,
  ol: Ol,
  li: Li,
  table: Table,
  th: Th,
  td: Td,
  // Override bare <img> (from ![alt](src) markdown) with next/image
  img: PostImage,
  // Custom components available in MDX files as <PostImage> and <Callout>
  PostImage,
  Callout,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
