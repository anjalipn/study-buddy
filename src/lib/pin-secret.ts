import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scrypt = promisify(scryptCallback)

export async function hashPin(pin: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex")
  const derived = (await scrypt(pin, salt, 32)) as Buffer
  return { hash: derived.toString("hex"), salt }
}

export async function pinMatches(
  pin: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const derived = (await scrypt(pin, salt, 32)) as Buffer
  const expected = Buffer.from(hash, "hex")
  if (expected.length !== derived.length) return false
  return timingSafeEqual(expected, derived)
}
