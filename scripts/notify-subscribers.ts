/**
 * scripts/notify-subscribers.ts
 *
 * Run after publishing a new blog post:
 *   npm run notify
 *
 * Fetches active subscribers from Resend Audience, sends a styled email
 * to each one via Resend.
 */

import { config } from 'dotenv'
import { join } from 'path'

// Load .env.local (Next.js convention) — dotenv defaults to .env, not .env.local
config({ path: join(process.cwd(), '.env.local') })

// Corporate proxy (Capgemini) performs SSL inspection and re-signs TLS certs
// with an enterprise CA that Node.js doesn't trust by default.
// This flag tells Node to skip TLS verification for this script only.
// Safe here because we control the target (api.resend.com) and this is a local CLI tool.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { Resend } from 'resend'
import { getAllPosts, type Post } from '../lib/posts'

// ─── Thin Resend wrapper using Node built-in fetch ────────────────────────────
async function sendEmail(apiKey: string, payload: {
  from: string; to: string; subject: string; html: string
}): Promise<{ id?: string; error?: { name: string; message: string } }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, to: [payload.to] }),
  })
  const data = await res.json() as { id?: string; name?: string; message?: string }
  if (!res.ok) return { error: { name: data.name ?? 'error', message: data.message ?? res.statusText } }
  return { id: data.id }
}

// ─── Load subscribers from Resend Audience ──────────────────────────────────

async function fetchSubscribers(apiKey: string, audienceId: string): Promise<string[]> {
  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )
  if (!res.ok) {
    console.error('Failed to fetch subscribers from Resend:', res.statusText)
    return []
  }
  const { data } = await res.json() as { data?: { email: string; unsubscribed: boolean }[] }
  return (data ?? []).filter(c => !c.unsubscribed).map(c => c.email)
}

function getLatestPost(): Post | null {
  const posts = getAllPosts() // already sorted by date desc from posts.ts
  return posts[0] ?? null
}

// ─── Email template ───────────────────────────────────────────────────────────

function buildEmail(post: Post): string {
  const postUrl = `https://blog.yatharthmishra.dev/blog/${post.slug}`
  const date = new Date(post.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  const tags = (post.tags ?? []).map(t => `<span style="display:inline-block;padding:2px 8px;font-size:11px;color:#00ff87;background:rgba(0,255,135,0.08);border:1px solid rgba(0,255,135,0.2);border-radius:3px;margin:0 4px 4px 0;">${t}</span>`).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${post.title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border:1px solid #1f1f1f;border-radius:4px;overflow:hidden;">

        <!-- Branding bar -->
        <tr><td style="padding:20px 40px;border-bottom:1px solid #1f1f1f;">
          <p style="margin:0;font-size:11px;color:#00ff87;letter-spacing:0.08em;">NEW POST — blog.yatharthmishra.dev</p>
        </td></tr>

        <!-- Post details -->
        <tr><td style="padding:32px 40px 24px;">
          <p style="margin:0 0 8px;font-size:11px;color:#71717a;">${date}</p>
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:500;color:#fafafa;line-height:1.3;">${post.title}</h1>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#71717a;">${post.summary}</p>
          ${tags ? `<div style="margin-bottom:24px;">${tags}</div>` : ''}
          <a href="${postUrl}"
             style="display:inline-block;padding:10px 24px;background:transparent;border:1px solid #00ff87;color:#00ff87;font-size:13px;text-decoration:none;border-radius:3px;">
            → Read the full post
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #1f1f1f;">
          <p style="margin:0;font-size:11px;color:#3f3f46;">
            You're receiving this because you subscribed at blog.yatharthmishra.dev.
            <a href="https://blog.yatharthmishra.dev/api/unsubscribe?email={{EMAIL}}" style="color:#71717a;">Unsubscribe</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌  RESEND_API_KEY is not set in .env.local')
    process.exit(1)
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    console.error('❌  RESEND_AUDIENCE_ID is not set in .env.local')
    process.exit(1)
  }

  const post = getLatestPost()
  if (!post) {
    console.error('❌  No posts found in content/posts/')
    process.exit(1)
  }

  const subscribers = await fetchSubscribers(apiKey, audienceId)
  if (subscribers.length === 0) {
    console.log('ℹ️  No subscribers yet — nothing to send.')
    return
  }

  console.log(`📬  Sending "${post.title}" to ${subscribers.length} subscriber(s)…`)

  const template = buildEmail(post)
  let sent = 0, failed = 0

  for (const email of subscribers) {
    try {
      const html = template.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(email))

      const response = await sendEmail(apiKey, {
        from:    'Yatharth Mishra <newsletter@yatharthmishra.dev>',
        to:      email,
        subject: `New post: ${post.title}`,
        html,
      })

      if (response.error) {
        throw new Error(`${response.error.name}: ${response.error.message}`)
      }

      console.log(`  ✅  ${email} (id: ${response.id})`)
      sent++
    } catch (err) {
      console.error(`  ❌  ${email}:`, err)
      failed++
    }
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`)
}

main()
