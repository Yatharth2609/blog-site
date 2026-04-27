/**
 * app/api/unsubscribe/route.ts
 *
 * GET /api/unsubscribe?email=...
 * → Removes email from data/subscribers.json
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const SUBSCRIBERS_FILE = join(process.cwd(), 'data', 'subscribers.json')

function loadSubscribers(): string[] {
  if (!existsSync(SUBSCRIBERS_FILE)) return []
  try { return JSON.parse(readFileSync(SUBSCRIBERS_FILE, 'utf-8')) }
  catch { return [] }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email) {
    return new NextResponse('Missing email', { status: 400 })
  }

  const list = loadSubscribers()
  const updated = list.filter(e => e !== email)
  writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(updated, null, 2), 'utf-8')

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
