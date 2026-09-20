import { NextResponse } from "next/server"

import { databaseUnavailable } from "@/lib/api-auth"
import { loadPinRecord, saveLockState } from "@/lib/db"
import { pinMatches } from "@/lib/pin-secret"
import { isPin } from "@/lib/selectors"
import { createSessionCookie } from "@/lib/session"

export const dynamic = "force-dynamic"

const MAX_ATTEMPTS = 8
const LOCK_MS = 5 * 60 * 1000

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
  if (!record.pinHash || !record.pinSalt) {
    return NextResponse.json(
      { error: "Set a family PIN first." },
      { status: 400 },
    )
  }

  if (record.lockedUntil && new Date(record.lockedUntil).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Too many tries. Wait a few minutes and try again." },
      { status: 429 },
    )
  }

  const ok = await pinMatches(pin, record.pinHash, record.pinSalt)
  if (!ok) {
    const attempts = record.failedAttempts + 1
    const locked =
      attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS) : null
    await saveLockState(attempts, locked)
    return NextResponse.json(
      {
        error: locked
          ? "Too many tries. Wait a few minutes and try again."
          : "That PIN is not right. Try again.",
      },
      { status: locked ? 429 : 401 },
    )
  }

  await saveLockState(0, null)
  await createSessionCookie()
  return NextResponse.json({ ok: true })
}
