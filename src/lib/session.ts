import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

const COOKIE = "study_buddy_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90

function secret(): string {
  const value = process.env.SESSION_SECRET?.trim()
  if (!value) {
    throw new Error("SESSION_SECRET is not set")
  }
  return value
}

function sign(payload: string): string {
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

function verify(token: string): string | null {
  const split = token.lastIndexOf(".")
  if (split <= 0) return null
  const payload = token.slice(0, split)
  const signature = token.slice(split + 1)
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url")
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return payload
}

export async function createSessionCookie(): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url")
  const token = sign(payload)
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
  return token
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function hasSession(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (!token) return false
  const payload = verify(token)
  if (!payload) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      exp?: number
    }
    return typeof parsed.exp === "number" && parsed.exp > Date.now()
  } catch {
    return false
  }
}
