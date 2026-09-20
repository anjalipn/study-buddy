import { createSeedData } from "@/lib/seed"
import type { AppData, Session } from "@/lib/types"
import {
  YEAR_4_VOCABULARY_CARDS,
  YEAR_4_VOCAB_DECK_ID,
  YEAR_4_VOCAB_TITLE,
} from "@/lib/year4-vocabulary"

export const DATA_KEY = "study-buddy-v1"
export const SESSION_KEY = "study-buddy-session"

export const STORAGE_ERROR =
  "Study Buddy could not read saved data on this device. Check that your browser allows local storage, then try again."

function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false
  const data = value as AppData
  return (
    data.version === 1 &&
    (data.pin === null || typeof data.pin === "string") &&
    Array.isArray(data.kids) &&
    Array.isArray(data.subjects) &&
    Array.isArray(data.decks) &&
    Array.isArray(data.cards) &&
    Array.isArray(data.progress)
  )
}

export function loadData(): AppData {
  const raw = window.localStorage.getItem(DATA_KEY)
  if (!raw) {
    const seeded = createSeedData()
    window.localStorage.setItem(DATA_KEY, JSON.stringify(seeded))
    return seeded
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(STORAGE_ERROR)
  }

  if (!isAppData(parsed)) {
    throw new Error(STORAGE_ERROR)
  }

  return mergeYear4Vocabulary(parsed)
}

function mergeYear4Vocabulary(data: AppData): AppData {
  const decks = data.decks.map((deck) =>
    deck.id === YEAR_4_VOCAB_DECK_ID
      ? { ...deck, title: YEAR_4_VOCAB_TITLE }
      : deck,
  )

  const cards = [...data.cards]
  for (const word of YEAR_4_VOCABULARY_CARDS) {
    const index = cards.findIndex((card) => card.id === word.id)
    if (index === -1) {
      cards.push(word)
    } else if (cards[index].kidId === null) {
      cards[index] = word
    }
  }

  const next = { ...data, decks, cards }
  window.localStorage.setItem(DATA_KEY, JSON.stringify(next))
  return next
}

export function saveData(data: AppData): void {
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

export function clearData(): void {
  window.localStorage.removeItem(DATA_KEY)
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function loadSession(): Session {
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Session
    if (
      parsed === null ||
      parsed.role === "admin" ||
      (parsed.role === "kid" && typeof parsed.kidId === "string")
    ) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  if (!session) {
    window.sessionStorage.removeItem(SESSION_KEY)
    return
  }
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}
