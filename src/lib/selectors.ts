import type {
  AppData,
  CardStatus,
  Deck,
  Flashcard,
  Kid,
  SchoolYear,
  Subject,
} from "@/lib/types"

export function yearLabel(year: SchoolYear): string {
  return `Year ${year}`
}

export function getKid(data: AppData, kidId: string): Kid | undefined {
  return data.kids.find((kid) => kid.id === kidId)
}

export function getSubject(
  data: AppData,
  subjectId: string,
): Subject | undefined {
  return data.subjects.find((subject) => subject.id === subjectId)
}

export function getDeck(data: AppData, deckId: string): Deck | undefined {
  return data.decks.find((deck) => deck.id === deckId)
}

export function decksForYear(data: AppData, year: SchoolYear): Deck[] {
  return data.decks
    .filter((deck) => deck.year === year)
    .sort((a, b) => {
      const subjectA = getSubject(data, a.subjectId)?.name ?? ""
      const subjectB = getSubject(data, b.subjectId)?.name ?? ""
      return subjectA.localeCompare(subjectB)
    })
}

export function sharedCards(data: AppData, deckId: string): Flashcard[] {
  return data.cards.filter(
    (card) => card.deckId === deckId && card.kidId === null,
  )
}

export function personalCards(
  data: AppData,
  deckId: string,
  kidId: string,
): Flashcard[] {
  return data.cards.filter(
    (card) => card.deckId === deckId && card.kidId === kidId,
  )
}

export function studyCards(
  data: AppData,
  deckId: string,
  kidId: string,
): Flashcard[] {
  return data.cards.filter(
    (card) =>
      card.deckId === deckId && (card.kidId === null || card.kidId === kidId),
  )
}

export function cardStatus(
  data: AppData,
  kidId: string,
  cardId: string,
): CardStatus {
  return (
    data.progress.find(
      (entry) => entry.kidId === kidId && entry.cardId === cardId,
    )?.status ?? "unseen"
  )
}

export function deckProgress(
  data: AppData,
  kidId: string,
  deckId: string,
): { known: number; learning: number; total: number } {
  const cards = studyCards(data, deckId, kidId)
  let known = 0
  let learning = 0
  for (const card of cards) {
    const status = cardStatus(data, kidId, card.id)
    if (status === "know") known += 1
    if (status === "learning") learning += 1
  }
  return { known, learning, total: cards.length }
}

export function isPin(value: string): boolean {
  return /^\d{4}$/.test(value)
}
