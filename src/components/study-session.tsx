"use client"

import { useState } from "react"
import Link from "next/link"

import { FlipCard } from "@/components/flip-card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cardStatus } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import type { Flashcard } from "@/lib/types"
import { formatAddedOn } from "@/lib/weeks"

function practiseQueue(
  cards: Flashcard[],
  data: ReturnType<typeof useStore>["data"],
  kidId: string,
): Flashcard[] {
  const remaining = cards.filter(
    (card) => cardStatus(data, kidId, card.id) !== "know",
  )
  return remaining.length > 0 ? remaining : cards
}

export function StudySession({
  kidId,
  cards,
  title,
  eyebrow,
  closeHref,
  empty,
}: {
  kidId: string
  cards: Flashcard[]
  title: string
  eyebrow: string
  closeHref: string
  empty: { title: string; description: string; href: string; label: string }
}) {
  const { data, markCard } = useStore()
  const [queueOverride, setQueueOverride] = useState<Flashcard[] | null>(null)
  const [flipped, setFlipped] = useState(false)

  const knownCount = cards.filter(
    (card) => cardStatus(data, kidId, card.id) === "know",
  ).length
  const queue = queueOverride ?? practiseQueue(cards, data, kidId)
  const current = queue[0]
  const remaining = queue.length
  const percent =
    cards.length === 0 ? 0 : Math.round((knownCount / cards.length) * 100)

  function begin(from: Flashcard[]) {
    setQueueOverride(from)
    setFlipped(false)
  }

  function mark(status: "know" | "learning") {
    if (!current) return
    markCard(kidId, current.id, status)
    setFlipped(false)
    setQueueOverride((currentQueue) => {
      const source = currentQueue ?? queue
      const [, ...rest] = source
      if (status === "learning") return [...rest, current]
      return rest
    })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-5 sm:max-w-5xl sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" asChild className="-ml-2 h-11 px-2 text-base">
          <Link href={closeHref}>Close</Link>
        </Button>
        <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
      </div>

      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {knownCount} of {cards.length} known
        {current ? ` · ${remaining} left this round` : ""}
      </p>
      <Progress value={percent} className="mt-3 h-2" />

      {cards.length === 0 ? (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-semibold">{empty.title}</h2>
          <p className="mt-2 text-base leading-7 text-muted-foreground">
            {empty.description}
          </p>
          <Button asChild className="mt-6 h-12 px-5 text-base">
            <Link href={empty.href}>{empty.label}</Link>
          </Button>
        </div>
      ) : current ? (
        <div className="mt-8 flex flex-1 flex-col">
          <FlipCard
            front={current.front}
            back={current.back}
            word={current.word}
            addedOn={formatAddedOn(current.addedAt)}
            flipped={flipped}
            onFlip={() => setFlipped((value) => !value)}
          />
          <div className="mt-auto grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="h-16 text-lg font-semibold"
              onClick={() => mark("learning")}
            >
              Still learning
            </Button>
            <Button
              className="h-16 bg-emerald-700 text-lg font-semibold hover:bg-emerald-700/90"
              onClick={() => mark("know")}
            >
              I know this
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 flex flex-1 flex-col">
          <h2 className="font-heading text-2xl font-semibold">
            That’s this round done
          </h2>
          <p className="mt-3 max-w-prose text-base leading-7 text-muted-foreground">
            {knownCount === cards.length
              ? `You have marked every card in ${title} as known.`
              : `You still have ${cards.length - knownCount} card${
                  cards.length - knownCount === 1 ? "" : "s"
                } marked still learning.`}
          </p>
          <Button
            className="mt-8 h-14 px-5 text-base"
            onClick={() => begin(practiseQueue(cards, data, kidId))}
          >
            Practise again
          </Button>
          <Button asChild variant="ghost" className="mt-3 h-12 text-base">
            <Link href={closeHref}>Back</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
