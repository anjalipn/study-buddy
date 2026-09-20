import { NextResponse } from "next/server"

import { databaseUnavailable } from "@/lib/api-auth"
import { clearSessionCookie } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST() {
  const unavailable = databaseUnavailable()
  if (unavailable) return unavailable
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
