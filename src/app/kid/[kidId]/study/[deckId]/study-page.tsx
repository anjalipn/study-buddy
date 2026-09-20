"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { ErrorScreen } from "@/components/error-screen"
import { FlipCard } from "@/components/flip-card"
import { StoreReady } from "@/components/store-ready"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  cardStatus,
  getDeck,
  getKid,
  getSubject,
  studyCards,
  yearLabel,
} from "@/lib/selectors"
import { useStore } from "@/lib/store"
import type { Flashcard } from "@/lib/types"

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

export function StudyPage({
  params,
}: {
  params: Promise<{ kidId: string; deckId: string }>
}) {
  const { kidId, deckId } = use(params)
  const { data, loginKid, markCard, clearDeckProgress } = useStore()
  const kid = getKid(data, kidId)
  const deck = getDeck(data, deckId)
  const subject = deck ? getSubject(data, deck.subjectId) : undefined
  const cards = useMemo(
    () => (kid && deck ? studyCards(data, deck.id, kid.id) : []),
    [data, deck, kid],
  )

  const [queueOverride, setQueueOverride] = useState<Flashcard[] | null>(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (kid) loginKid(kid.id)
  }, [kid, loginKid])

  const knownCount = kid
    ? cards.filter((card) => cardStatus(data, kid.id, card.id) === "know")
        .length
    : 0

  const queue =
    queueOverride ?? (kid ? practiseQueue(cards, data, kid.id) : [])
  const current = queue[0]
  const remaining = queue.length
  const percent =
    cards.length === 0 ? 0 : Math.round((knownCount / cards.length) * 100)

  function begin(from: Flashcard[]) {
    setQueueOverride(from)
    setFlipped(false)
  }

  function mark(status: "know" | "learning") {
    if (!current || !kid) return
    markCard(kid.id, current.id, status)
    setFlipped(false)
    setQueueOverride((currentQueue) => {
      const source = currentQueue ?? queue
      const [, ...rest] = source
      if (status === "learning") return [...rest, current]
      return rest
    })
  }

  if (!kid) {
    return (
      <StoreReady>
        <ErrorScreen
          title="Profile not found"
          description="That child is no longer on this device. Ask a parent to add the profile again."
        />
      </StoreReady>
    )
  }

  if (!deck || !subject || deck.year !== kid.year) {
    return (
      <StoreReady>
        <ErrorScreen
          title="Deck not found"
          description="This deck is not available for this year."
        />
      </StoreReady>
    )
  }

  return (
    <StoreReady>
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-5 sm:max-w-5xl sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button variant="ghost" asChild className="h-11 -ml-2 px-2 text-base">
            <Link href={`/kid/${kid.id}`}>Close</Link>
          </Button>
          <p className="text-sm font-medium text-muted-foreground">
            {subject.name} · {yearLabel(kid.year)}
          </p>
        </div>

        <h1 className="font-heading text-2xl font-semibold">{deck.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {knownCount} of {cards.length} known
          {current ? ` · ${remaining} left this round` : ""}
        </p>
        <Progress value={percent} className="mt-3 h-2" />

        {cards.length === 0 ? (
          <div className="mt-10">
            <h2 className="font-heading text-xl font-semibold">
              Nothing to study yet
            </h2>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Add a personal card, or ask a parent to fill this year deck.
            </p>
            <Button asChild className="mt-6 h-12 px-5 text-base">
              <Link href={`/kid/${kid.id}/deck/${deck.id}`}>Go to cards</Link>
            </Button>
          </div>
        ) : current ? (
          <div className="mt-8 flex flex-1 flex-col">
            <FlipCard
              front={current.front}
              back={current.back}
              word={current.word}
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
                ? `You have marked every card in ${deck.title} as known.`
                : `You still have ${cards.length - knownCount} card${
                    cards.length - knownCount === 1 ? "" : "s"
                  } marked still learning.`}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-14 flex-1 px-5 text-base"
                onClick={() =>
                  begin(practiseQueue(cards, data, kid.id))
                }
              >
                Practise again
              </Button>
              <Button
                variant="outline"
                className="h-14 flex-1 px-5 text-base"
                onClick={() => {
                  clearDeckProgress(kid.id, deck.id)
                  begin(cards)
                }}
              >
                Start marks over
              </Button>
            </div>
            <Button asChild variant="ghost" className="mt-3 h-12 text-base">
              <Link href={`/kid/${kid.id}`}>Back to decks</Link>
            </Button>
          </div>
        )}
      </div>
    </StoreReady>
  )
}
