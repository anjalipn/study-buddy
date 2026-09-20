import { NextResponse } from "next/server"

import { requireSession } from "@/lib/api-auth"
import { resetAppData } from "@/lib/db"
import { clearSessionCookie } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST() {
  const denied = await requireSession()
  if (denied) return denied
  await resetAppData()
  await clearSessionCookie()
  return NextResponse.json({ ok: true })
}
