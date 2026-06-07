/**
 * app/api/subscribe/route.ts
 *
 * POST /api/subscribe   { email: string }
 * → Adds contact to Resend Audience (deduped by Resend)
 * → Sends a welcome email via Resend
 *
 * No filesystem writes — safe on Vercel's read-only runtime.
 * Requires env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID
 */

import { NextRequest, NextResponse } from 'next/server'

const RESEND_BASE = 'https://api.resend.com'

async function resend<T>(apiKey: string, path: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
  const res = await fetch(`${RESEND_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const json = await res.json() as Record<string, unknown>
  if (!res.ok) return { error: (json.message as string) ?? res.statusText }
  return { data: json as T }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()
    const apiKey     = process.env.RESEND_API_KEY
    const audienceId = process.env.RESEND_AUDIENCE_ID

    if (!apiKey || !audienceId) {
      console.error('[/api/subscribe] Missing RESEND_API_KEY or RESEND_AUDIENCE_ID')
      return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 })
    }

    // ── Add to Resend Audience ──────────────────────────────────────────────────
    // Resend deduplicates contacts by email within an audience automatically.
    const { error: contactError } = await resend(apiKey, `/audiences/${audienceId}/contacts`, {
      method: 'POST',
      body: JSON.stringify({ email: normalised, unsubscribed: false }),
    })

    if (contactError) {
      // "Contact already exists" is not a real error — Resend returns 409 for dupes
      if (!contactError.toLowerCase().includes('already exists')) {
        console.error('[/api/subscribe] Resend contact error:', contactError)
        return NextResponse.json({ error: 'Failed to subscribe. Try again.' }, { status: 500 })
      }
      return NextResponse.json({ message: 'Already subscribed!' })
    }

    // ── Welcome email ──────────────────────────────────────────────────────────
    // Fire-and-forget — don't block the subscribe response on email delivery.
    resend(apiKey, '/emails', {
      method: 'POST',
      body: JSON.stringify({
        from:    'Yatharth Mishra <newsletter@yatharthmishra.dev>',
        to:      [normalised],
        subject: "You're subscribed — Yatharth Mishra's blog",
        html:    welcomeEmail(normalised),
      }),
    }).catch(err => console.error('[/api/subscribe] welcome email failed:', err))

    return NextResponse.json({ message: 'Subscribed!' })
  } catch (err) {
    console.error('[/api/subscribe]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

function welcomeEmail(email: string): string {
  const unsubscribeUrl = `https://blog.yatharthmishra.dev/api/unsubscribe?email=${encodeURIComponent(email)}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>You're subscribed</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border:1px solid #1f1f1f;border-radius:4px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="padding:32px 40px;border-bottom:1px solid #1f1f1f;">
          <p style="margin:0;font-size:12px;color:#00ff87;letter-spacing:0.08em;">blog.yatharthmishra.dev</p>
          <h1 style="margin:12px 0 0;font-size:20px;color:#fafafa;font-weight:500;">You're subscribed ✦</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#71717a;">
            Hey — thanks for subscribing. You'll get an email whenever I publish a new post on
            engineering, AI agents, and what I'm building in production.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:#71717a;">
            No spam, no cadence goals. Just the good stuff.
          </p>
          <a href="https://blog.yatharthmishra.dev/blog"
             style="display:inline-block;padding:10px 20px;background:transparent;border:1px solid #00ff87;color:#00ff87;font-size:13px;text-decoration:none;border-radius:3px;">
            → Browse the blog
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #1f1f1f;">
          <p style="margin:0;font-size:11px;color:#3f3f46;">
            You subscribed at blog.yatharthmishra.dev. Don't want emails?
            <a href="${unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
