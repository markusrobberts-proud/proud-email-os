import { NextResponse } from "next/server"

/**
 * Pinged on a 5-minute cron so Vercel doesn't let the function go cold.
 * Cheap: just touches the runtime, no DB queries, no Clerk calls.
 */
export async function GET() {
  return NextResponse.json({ ok: true, at: new Date().toISOString() })
}
