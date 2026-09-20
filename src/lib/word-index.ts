import type { Flashcard } from "@/lib/types"

export const ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
] as const

export type AlphabetLetter = (typeof ALPHABET)[number]

const TAB_COLORS = [
  "#f97316",
  "#eab308",
  "#84cc16",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#78716c",
]

export function tabColor(letter: string): string {
  const index = ALPHABET.indexOf(letter as AlphabetLetter)
  return TAB_COLORS[(index === -1 ? 0 : index) % TAB_COLORS.length]
}

export function startingLetter(text: string): string {
  const match = text.trim().match(/[A-Za-z]/)
  return match ? match[0].toUpperCase() : "#"
}

export function sortByFront(cards: Flashcard[]): Flashcard[] {
  return [...cards].sort((a, b) =>
    a.front.localeCompare(b.front, "en-GB", { sensitivity: "base" }),
  )
}

export function cardMatchesQuery(card: Flashcard, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const parts = [
    card.front,
    card.back,
    ...(card.word?.partsOfSpeech ?? []),
    card.word?.band,
    card.word?.level,
    card.word?.theme?.name,
    ...(card.word?.theme?.values ?? []),
    ...(card.word?.definitions ?? []),
    card.word?.usageContext,
    ...(card.word?.synonyms ?? []),
    ...(card.word?.antonyms ?? []),
    card.word?.additionalInfo,
    ...(card.word?.examples ?? []),
  ]
  return parts.some((part) => part?.toLowerCase().includes(needle))
}

export function isVocabularyDeck(cards: Flashcard[]): boolean {
  return cards.some((card) => Boolean(card.word))
}
