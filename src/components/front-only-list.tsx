"use client"

import type { Flashcard } from "@/lib/types"
import { sortByFront } from "@/lib/word-index"

export function FrontOnlyList({
  cards,
  onOpen,
}: {
  cards: Flashcard[]
  onOpen: (card: Flashcard) => void
}) {
  return (
    <ul className="divide-y rounded-2xl bg-card ring-1 ring-foreground/10">
      {sortByFront(cards).map((card) => (
        <li key={card.id}>
          <button
            type="button"
            onClick={() => onOpen(card)}
            className="flex w-full items-center px-5 py-4 text-left text-xl font-semibold hover:bg-muted/50"
          >
            {card.front}
          </button>
        </li>
      ))}
    </ul>
  )
}
