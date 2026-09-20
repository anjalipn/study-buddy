export const SCHOOL_YEARS = [1, 2, 3, 4] as const
export type SchoolYear = (typeof SCHOOL_YEARS)[number]

export const AVATAR_IDS = [
  "fox",
  "owl",
  "otter",
  "robin",
  "badger",
  "hare",
] as const
export type AvatarId = (typeof AVATAR_IDS)[number]

export type CardStatus = "unseen" | "know" | "learning"

export type Kid = {
  id: string
  name: string
  year: SchoolYear
  avatar: AvatarId
}

export type Subject = {
  id: string
  name: string
}

export type Deck = {
  id: string
  subjectId: string
  year: SchoolYear
  title: string
}

export type WordDetails = {
  partsOfSpeech: string[]
  level: string
  band: string
  theme?: {
    name: string
    values: string[]
  }
  definitions: string[]
  usageContext?: string
  synonyms: string[]
  antonyms: string[]
  additionalInfo?: string
  examples: string[]
}

export type Flashcard = {
  id: string
  deckId: string
  /** null = shared year-level card; otherwise a child's personal card */
  kidId: string | null
  front: string
  back: string
  word?: WordDetails
  addedAt: string
}

export type ProgressEntry = {
  kidId: string
  cardId: string
  status: Exclude<CardStatus, "unseen">
}

export type AppData = {
  version: 1
  weekStartsOn?: "sunday"
  pin: string | null
  kids: Kid[]
  subjects: Subject[]
  decks: Deck[]
  cards: Flashcard[]
  progress: ProgressEntry[]
}

export type Session =
  | { role: "admin" }
  | { role: "kid"; kidId: string }
  | null
