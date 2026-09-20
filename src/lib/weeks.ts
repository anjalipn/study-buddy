import type { AppData, Flashcard, Kid } from "@/lib/types"
import { sortByFront } from "@/lib/word-index"

export function mondayOf(date: Date): Date {
  const day = new Date(date)
  day.setHours(12, 0, 0, 0)
  const weekday = day.getDay()
  const offset = weekday === 0 ? -6 : 1 - weekday
  day.setDate(day.getDate() + offset)
  day.setHours(0, 0, 0, 0)
  return day
}

export function seedVocabularyAddedAt(front: string, now = new Date()): string {
  const weeksAgo = ["library", "mention"].includes(front.toLowerCase()) ? 2 : 1
  return mondayWeeksAgo(weeksAgo, now).toISOString()
}

export function mondayWeeksAgo(weeksAgo: number, now = new Date()): Date {
  const monday = mondayOf(now)
  monday.setDate(monday.getDate() - weeksAgo * 7)
  return monday
}

export function weekId(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value
  const monday = mondayOf(date)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, "0")
  const day = String(monday.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function weekLabel(id: string, now = new Date()): string {
  if (id === weekId(now)) return "This week"
  if (id === weekId(mondayWeeksAgo(1, now))) return "Last week"
  const start = new Date(`${id}T12:00:00`)
  const sameYear = start.getFullYear() === now.getFullYear()
  return `Week of ${start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  })}`
}

export function weekRangeLabel(id: string): string {
  const start = new Date(`${id}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const startText = start.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
  })
  const endText = end.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  return `${startText} – ${endText}`
}

export function formatAddedOn(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function vocabWordsForKid(data: AppData, kid: Kid): Flashcard[] {
  const yearDeckIds = new Set(
    data.decks.filter((deck) => deck.year === kid.year).map((deck) => deck.id),
  )
  return data.cards.filter(
    (card) =>
      Boolean(card.word) &&
      yearDeckIds.has(card.deckId) &&
      (card.kidId === null || card.kidId === kid.id),
  )
}

export type WeekGroup = {
  weekStart: string
  label: string
  cards: Flashcard[]
}

export function weeklyWordLists(
  cards: Flashcard[],
  now = new Date(),
): WeekGroup[] {
  const groups = new Map<string, Flashcard[]>()
  for (const card of cards) {
    const id = weekId(card.addedAt)
    const list = groups.get(id) ?? []
    list.push(card)
    groups.set(id, list)
  }

  const thisWeek = weekId(now)
  const lastWeek = weekId(mondayWeeksAgo(1, now))
  if (!groups.has(thisWeek)) groups.set(thisWeek, [])
  if (!groups.has(lastWeek)) groups.set(lastWeek, [])

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, weekCards]) => ({
      weekStart,
      label: weekLabel(weekStart, now),
      cards: sortByFront(weekCards),
    }))
}
