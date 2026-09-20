import { NextResponse } from "next/server"

import { databaseUnavailable } from "@/lib/api-auth"
import { loadPinRecord } from "@/lib/db"
import { hasSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function GET() {
  const unavailable = databaseUnavailable()
  if (unavailable) return unavailable
  const pin = await loadPinRecord()
  return NextResponse.json({
    hasPin: Boolean(pin.pinHash),
    authenticated: await hasSession(),
  })
}
