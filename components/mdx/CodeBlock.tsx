// Server component — shiki runs on the server only.
// The copy button is extracted to CopyButton.tsx ('use client').
import { codeToHtml } from 'shiki'
import CopyButton from './CopyButton'

interface CodeBlockProps {
  children?: string
  language?: string
  filename?: string
}

// Map common short aliases to full language IDs
const LANG_MAP: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  mdx: 'markdown',
  sql: 'sql',
}

async function highlight(code: string, lang: string): Promise<string> {
  const resolved = LANG_MAP[lang.toLowerCase()] ?? lang.toLowerCase()
  try {
    return await codeToHtml(code, {
      lang: resolved,
      theme: 'github-dark-dimmed',
    })
  } catch {
    // Unknown language — render as plain text
    try {
      return await codeToHtml(code, { lang: 'text', theme: 'github-dark-dimmed' })
    } catch {
      return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    }
  }
}

export default async function CodeBlock({
  children = '',
  language = 'text',
  filename,
}: CodeBlockProps) {
  const code = children.trimEnd()
  const html = await highlight(code, language)
  const label = filename ?? language

  return (
    <div
      className="my-6 rounded-sm overflow-hidden"
      style={{ border: '1px solid var(--border)', backgroundColor: '#22272e' }}
    >
      {/* Header: language/filename badge + copy button */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        <span
          className="text-xs px-1.5 py-0.5 rounded-sm"
          style={{
            color: 'var(--accent)',
            backgroundColor: 'var(--accent-dim)',
            fontFamily: 'var(--font-geist-mono)',
            border: '1px solid rgba(0,255,135,0.15)',
          }}
        >
          {label}
        </span>

        {/* Client island — only this button ships JS to the browser */}
        <CopyButton code={code} />
      </div>

      {/* Shiki-rendered HTML — all highlighting happens server-side */}
      <div
        className="overflow-x-auto"
        style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '13px', lineHeight: '1.65' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
