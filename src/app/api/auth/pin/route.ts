import { NextResponse } from "next/server"

import { databaseUnavailable } from "@/lib/api-auth"
import { loadPinRecord, savePinRecord } from "@/lib/db"
import { hashPin } from "@/lib/pin-secret"
import { isPin } from "@/lib/selectors"
import { createSessionCookie, hasSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const unavailable = databaseUnavailable()
  if (unavailable) return unavailable

  let pin = ""
  try {
    const body = (await request.json()) as { pin?: string }
    pin = body.pin ?? ""
  } catch {
    return NextResponse.json({ error: "Send a four-digit PIN." }, { status: 400 })
  }
  if (!isPin(pin)) {
    return NextResponse.json({ error: "Enter four digits." }, { status: 400 })
  }

  const record = await loadPinRecord()
  if (record.pinHash && !(await hasSession())) {
    return NextResponse.json(
      { error: "Enter the current PIN before changing it." },
      { status: 401 },
    )
  }

  const stored = await hashPin(pin)
  await savePinRecord(stored.hash, stored.salt)
  await createSessionCookie()
  return NextResponse.json({ ok: true })
}
