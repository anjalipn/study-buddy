import { neon } from "@neondatabase/serverless"

import { createSeedData } from "@/lib/seed"
import type { AppData, Flashcard, ProgressEntry } from "@/lib/types"

/** Neon/Vercel injects several names; prefer unpooled so transactions persist. */
const DATABASE_URL_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
] as const

function databaseUrl(): string | null {
  for (const key of DATABASE_URL_KEYS) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return null
}

export function hasDatabaseUrl(): boolean {
  return Boolean(databaseUrl())
}

export function hasSessionSecret(): boolean {
  return Boolean(process.env.SESSION_SECRET?.trim())
}

export function isDatabaseConfigured(): boolean {
  return hasDatabaseUrl() && hasSessionSecret()
}

export type DatabaseHealth = {
  database: boolean
  hasDatabaseUrl: boolean
  hasSessionSecret: boolean
  connected: boolean | null
}

export async function databaseHealth(): Promise<DatabaseHealth> {
  const configured = isDatabaseConfigured()
  const health: DatabaseHealth = {
    database: configured,
    hasDatabaseUrl: hasDatabaseUrl(),
    hasSessionSecret: hasSessionSecret(),
    connected: null,
  }
  if (!configured) return health
  try {
    await sql()`SELECT 1`
    health.connected = true
  } catch {
    health.connected = false
  }
  return health
}

function sql() {
  const url = databaseUrl()
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return neon(url)
}

export type PinRecord = {
  pinHash: string | null
  pinSalt: string | null
  failedAttempts: number
  lockedUntil: string | null
}

let schemaReady = false

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return
  const db = sql()
  await db`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    pin_hash TEXT,
    pin_salt TEXT,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ
  )`
  await db`CREATE TABLE IF NOT EXISTS kids (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    avatar TEXT NOT NULL
  )`
  await db`CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`
  await db`CREATE TABLE IF NOT EXISTS decks (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    title TEXT NOT NULL
  )`
  await db`CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    kid_id TEXT REFERENCES kids(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    word JSONB,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await db`CREATE TABLE IF NOT EXISTS progress (
    kid_id TEXT NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    PRIMARY KEY (kid_id, card_id)
  )`
  const settings = await db`SELECT id FROM settings WHERE id = 1`
  if (settings.length === 0) {
    await db`INSERT INTO settings (id) VALUES (1)`
  }
  await insertSeedIfEmpty()
  schemaReady = true
}

export async function loadPinRecord(): Promise<PinRecord> {
  await ensureSchema()
  const rows = await sql()`
    SELECT pin_hash, pin_salt, failed_attempts, locked_until
    FROM settings WHERE id = 1
  `
  const row = rows[0]
  return {
    pinHash: row?.pin_hash ?? null,
    pinSalt: row?.pin_salt ?? null,
    failedAttempts: Number(row?.failed_attempts ?? 0),
    lockedUntil: row?.locked_until
      ? new Date(row.locked_until as string).toISOString()
      : null,
  }
}

export async function savePinRecord(
  pinHash: string,
  pinSalt: string,
): Promise<void> {
  await ensureSchema()
  await sql()`
    UPDATE settings
    SET pin_hash = ${pinHash},
        pin_salt = ${pinSalt},
        failed_attempts = 0,
        locked_until = NULL
    WHERE id = 1
  `
}

export async function saveLockState(
  failedAttempts: number,
  lockedUntil: Date | null,
): Promise<void> {
  await ensureSchema()
  await sql()`
    UPDATE settings
    SET failed_attempts = ${failedAttempts},
        locked_until = ${lockedUntil ? lockedUntil.toISOString() : null}
    WHERE id = 1
  `
}

export async function loadAppData(): Promise<AppData> {
  await ensureSchema()
  const db = sql()
  const [kids, subjects, decks, cards, progress] = await Promise.all([
    db`SELECT id, name, year, avatar FROM kids ORDER BY name`,
    db`SELECT id, name FROM subjects ORDER BY name`,
    db`SELECT id, subject_id, year, title FROM decks`,
    db`SELECT id, deck_id, kid_id, front, back, word, added_at FROM cards`,
    db`SELECT kid_id, card_id, status FROM progress`,
  ])
  const pin = await loadPinRecord()

  return {
    version: 1,
    weekStartsOn: "sunday",
    seedWordsMovedToThisWeek: true,
    pin: pin.pinHash ? "__set__" : null,
    kids: kids.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      year: Number(row.year) as AppData["kids"][number]["year"],
      avatar: row.avatar as AppData["kids"][number]["avatar"],
    })),
    subjects: subjects.map((row) => ({
      id: String(row.id),
      name: String(row.name),
    })),
    decks: decks.map((row) => ({
      id: String(row.id),
      subjectId: String(row.subject_id),
      year: Number(row.year) as AppData["decks"][number]["year"],
      title: String(row.title),
    })),
    cards: cards.map(mapCard),
    progress: progress.map((row) => ({
      kidId: String(row.kid_id),
      cardId: String(row.card_id),
      status: row.status as ProgressEntry["status"],
    })),
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  await ensureSchema()
  await insertSnapshot(data)
}

export async function resetAppData(): Promise<void> {
  schemaReady = false
  const db = sql()
  await db`DROP TABLE IF EXISTS progress CASCADE`
  await db`DROP TABLE IF EXISTS cards CASCADE`
  await db`DROP TABLE IF EXISTS decks CASCADE`
  await db`DROP TABLE IF EXISTS kids CASCADE`
  await db`DROP TABLE IF EXISTS subjects CASCADE`
  await db`DROP TABLE IF EXISTS settings CASCADE`
  await ensureSchema()
}

async function insertSeedIfEmpty(): Promise<void> {
  const db = sql()
  const [subjects, kids, cards, pin] = await Promise.all([
    db`SELECT count(*)::int AS n FROM subjects`,
    db`SELECT count(*)::int AS n FROM kids`,
    db`SELECT count(*)::int AS n FROM cards`,
    db`SELECT pin_hash FROM settings WHERE id = 1`,
  ])
  const empty =
    Number(subjects[0]?.n ?? 0) === 0 &&
    Number(kids[0]?.n ?? 0) === 0 &&
    Number(cards[0]?.n ?? 0) === 0 &&
    !pin[0]?.pin_hash
  if (!empty) return

  const seed = createSeedData()
  const queries = [
    ...seed.subjects.map(
      (subject) =>
        db`INSERT INTO subjects (id, name) VALUES (${subject.id}, ${subject.name})
           ON CONFLICT (id) DO NOTHING`,
    ),
    ...seed.decks.map(
      (deck) =>
        db`INSERT INTO decks (id, subject_id, year, title)
           VALUES (${deck.id}, ${deck.subjectId}, ${deck.year}, ${deck.title})
           ON CONFLICT (id) DO NOTHING`,
    ),
    ...seed.cards.map(
      (card) =>
        db`INSERT INTO cards (id, deck_id, kid_id, front, back, word, added_at)
           VALUES (
             ${card.id},
             ${card.deckId},
             ${card.kidId},
             ${card.front},
             ${card.back},
             ${JSON.stringify(card.word ?? null)}::jsonb,
             ${card.addedAt}
           )
           ON CONFLICT (id) DO NOTHING`,
    ),
  ]
  await db.transaction(queries)
}

async function insertSnapshot(data: AppData): Promise<void> {
  const db = sql()
  const queries = [
    db`TRUNCATE TABLE progress, cards, decks, kids, subjects CASCADE`,
    ...data.subjects.map(
      (subject) =>
        db`INSERT INTO subjects (id, name) VALUES (${subject.id}, ${subject.name})`,
    ),
    ...data.decks.map(
      (deck) =>
        db`INSERT INTO decks (id, subject_id, year, title)
           VALUES (${deck.id}, ${deck.subjectId}, ${deck.year}, ${deck.title})`,
    ),
    ...data.kids.map(
      (kid) =>
        db`INSERT INTO kids (id, name, year, avatar)
           VALUES (${kid.id}, ${kid.name}, ${kid.year}, ${kid.avatar})`,
    ),
    ...data.cards.map(
      (card) =>
        db`INSERT INTO cards (id, deck_id, kid_id, front, back, word, added_at)
           VALUES (
             ${card.id},
             ${card.deckId},
             ${card.kidId},
             ${card.front},
             ${card.back},
             ${JSON.stringify(card.word ?? null)}::jsonb,
             ${card.addedAt}
           )`,
    ),
    ...data.progress.map(
      (entry) =>
        db`INSERT INTO progress (kid_id, card_id, status)
           VALUES (${entry.kidId}, ${entry.cardId}, ${entry.status})`,
    ),
  ]
  await db.transaction(queries)
}

function parseWord(value: unknown): Flashcard["word"] {
  if (!value) return undefined
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Flashcard["word"]
    } catch {
      return undefined
    }
  }
  if (typeof value === "object") return value as Flashcard["word"]
  return undefined
}

function mapCard(row: Record<string, unknown>): Flashcard {
  return {
    id: String(row.id),
    deckId: String(row.deck_id),
    kidId: row.kid_id == null ? null : String(row.kid_id),
    front: String(row.front),
    back: String(row.back),
    word: parseWord(row.word),
    addedAt: new Date(String(row.added_at)).toISOString(),
  }
}
