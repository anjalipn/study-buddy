"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Search } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { Input } from "@/components/ui/input"
import {
  ALPHABET,
  cardMatchesQuery,
  sortByFront,
  startingLetter,
  tabColor,
} from "@/lib/word-index"
import type { Flashcard } from "@/lib/types"
import { cn } from "@/lib/utils"

export function WordNotebook({
  cards,
  onOpen,
  extra,
}: {
  cards: Flashcard[]
  onOpen: (card: Flashcard) => void
  extra?: ReactNode
}) {
  const sorted = useMemo(() => sortByFront(cards), [cards])
  const lettersWithWords = useMemo(() => {
    const found = new Set(sorted.map((card) => startingLetter(card.front)))
    return found
  }, [sorted])
  const defaultLetter =
    ALPHABET.find((letter) => lettersWithWords.has(letter)) ?? "A"

  const [letter, setLetter] = useState(defaultLetter)
  const [query, setQuery] = useState("")

  const searching = query.trim().length > 0
  const visible = useMemo(() => {
    if (searching) {
      return sorted.filter((card) => cardMatchesQuery(card, query))
    }
    return sorted.filter((card) => startingLetter(card.front) === letter)
  }, [letter, query, searching, sorted])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search all words"
          className="h-12 pl-9 text-base"
          aria-label="Search all words"
        />
      </div>
      {extra}

      <div className="flex min-h-[40rem] items-stretch gap-0 sm:min-h-[44rem]">
        <nav
          aria-label="Words by letter"
          className="flex w-8 shrink-0 flex-col sm:w-10"
        >
          {ALPHABET.map((item) => {
            const active = !searching && letter === item
            const hasWords = lettersWithWords.has(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery("")
                  setLetter(item)
                }}
                className={cn(
                  "flex min-h-0 flex-1 items-center justify-center rounded-l-md text-[10px] font-bold text-white sm:text-xs",
                  active ? "z-10 -mr-0.5 shadow-md" : "opacity-80 hover:opacity-100",
                  !hasWords && "opacity-35",
                )}
                style={{ backgroundColor: tabColor(item) }}
                aria-current={active ? "page" : undefined}
                aria-label={`Words starting with ${item}${hasWords ? "" : ", none yet"}`}
              >
                {item}
              </button>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1 rounded-r-2xl bg-[#fffdf8] ring-1 ring-foreground/10">
          <div className="px-4 py-4 sm:px-6">
            <p className="text-sm font-medium text-muted-foreground">
              {searching
                ? `Search results${visible.length ? ` · ${visible.length}` : ""}`
                : `Words starting with ${letter}`}
            </p>

            {visible.length === 0 ? (
              <EmptyState
                className="mt-4 border-0 bg-transparent px-0"
                title={
                  searching
                    ? "No matching words"
                    : `No words starting with ${letter}`
                }
                description={
                  searching
                    ? "Try a different spelling, or search a synonym."
                    : "Pick another letter, or add a word to this deck."
                }
              />
            ) : (
              <ul className="mt-3 divide-y">
                {visible.map((card) => (
                  <li key={card.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(card)}
                      className="flex w-full items-baseline justify-between gap-3 py-3.5 text-left hover:text-primary"
                    >
                      <span className="text-2xl font-semibold tracking-tight">
                        {card.front}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {card.word?.partsOfSpeech.join(", ") ??
                          (card.kidId ? "My card" : "")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
