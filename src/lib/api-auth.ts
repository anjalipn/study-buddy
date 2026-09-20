import { NextResponse } from "next/server"

import { isDatabaseConfigured } from "@/lib/db"
import { hasSession } from "@/lib/session"

export function databaseUnavailable(): NextResponse | null {
  if (isDatabaseConfigured()) return null
  return NextResponse.json(
    { error: "Shared database is not configured on this server." },
    { status: 404 },
  )
}

export async function requireSession(): Promise<NextResponse | null> {
  const unavailable = databaseUnavailable()
  if (unavailable) return unavailable
  if (await hasSession()) return null
  return NextResponse.json({ error: "Enter the family PIN first." }, { status: 401 })
}
