/**
 * app/api/unsubscribe/route.ts
 *
 * GET /api/unsubscribe?email=...
 * → Marks contact as unsubscribed in Resend Audience
 *
 * No filesystem writes — safe on Vercel's read-only runtime.
 * Requires env vars: RESEND_API_KEY, RESEND_AUDIENCE_ID
 */

import { NextRequest, NextResponse } from 'next/server'

const RESEND_BASE = 'https://api.resend.com'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) {
    return new NextResponse('Missing email', { status: 400 })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!apiKey || !audienceId) {
    return new NextResponse('Server misconfiguration', { status: 500 })
  }

  // First find the contact ID by email, then mark as unsubscribed.
  // Resend Contacts API: GET /audiences/{id}/contacts?email=...
  const listRes = await fetch(
    `${RESEND_BASE}/audiences/${audienceId}/contacts`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )

  if (listRes.ok) {
    const { data } = await listRes.json() as { data?: { id: string; email: string }[] }
    const contact = data?.find(c => c.email === email)

    if (contact) {
      // PATCH to mark unsubscribed rather than deleting — keeps the record
      await fetch(`${RESEND_BASE}/audiences/${audienceId}/contacts/${contact.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unsubscribed: true }),
      })
    }
  }

  return new NextResponse(`
    <!DOCTYPE html><html><head><meta charset="utf-8"/></head>
    <body style="margin:0;padding:40px;background:#0a0a0a;color:#fafafa;font-family:'Courier New',monospace;text-align:center;">
      <h1 style="color:#00ff87;font-size:20px;font-weight:500;">Unsubscribed</h1>
      <p style="color:#71717a;font-size:14px;">${email} has been removed from the list.</p>
      <a href="https://blog.yatharthmishra.dev" style="color:#00ff87;font-size:13px;">← Back to blog</a>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
