"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { CardDetailDialog } from "@/components/card-detail-dialog"
import { EmptyState } from "@/components/empty-state"
import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getKid } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import type { Flashcard } from "@/lib/types"
import {
  formatAddedOn,
  vocabWordsForKid,
  weekRangeLabel,
  weeklyWordLists,
} from "@/lib/weeks"

export function WeeklyWordsPage({
  params,
}: {
  params: Promise<{ kidId: string }>
}) {
  const { kidId } = use(params)
  const { data, loginKid } = useStore()
  const kid = getKid(data, kidId)
  const [openCard, setOpenCard] = useState<Flashcard | null>(null)

  useEffect(() => {
    if (kid) loginKid(kid.id)
  }, [kid, loginKid])

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

  const words = vocabWordsForKid(data, kid)
  const weeks = weeklyWordLists(words)

  return (
    <StoreReady>
      <AppShell
        title="Weekly words"
        eyebrow="Revise and quiz"
        backHref={`/kid/${kid.id}`}
        backLabel="Decks"
      >
        <p className="text-base leading-7 text-muted-foreground">
          Words are grouped by the week they were added, Sunday to Saturday. A
          word added on any day in that range counts for that week. Open a word
          to read it, then revise or quiz.
        </p>

        {words.length === 0 ? (
          <EmptyState
            title="No weekly words yet"
            description="When a parent or you add vocabulary cards, they land in this week. Last week and older weeks stay here so you can revise them later."
            action={
              <Button asChild className="h-12 px-5 text-base">
                <Link href={`/kid/${kid.id}`}>Back to decks</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4">
            {weeks.map((week) => (
              <li key={week.weekStart}>
                <Card>
                  <CardContent className="flex flex-col gap-4 px-5 py-1">
                    <div>
                      <h2 className="font-heading text-xl font-semibold">
                        {week.label}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {weekRangeLabel(week.weekStart)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {week.cards.length === 0
                          ? "No words in this week yet"
                          : `${week.cards.length} word${week.cards.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    {week.cards.length > 0 ? (
                      <ul className="grid gap-2">
                        {week.cards.map((card) => (
                          <li key={card.id}>
                            <button
                              type="button"
                              onClick={() => setOpenCard(card)}
                              className="flex w-full flex-col items-start gap-1 rounded-xl bg-muted/60 px-4 py-3 text-left transition-colors hover:bg-muted sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                            >
                              <span className="font-heading text-lg font-semibold">
                                {card.front}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Added {formatAddedOn(card.addedAt)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {week.cards.length > 0 ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild className="h-12 flex-1 px-5 text-base">
                          <Link
                            href={`/kid/${kid.id}/weekly/${week.weekStart}/revise`}
                          >
                            Revise this week
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="h-12 flex-1 px-5 text-base"
                        >
                          <Link
                            href={`/kid/${kid.id}/weekly/${week.weekStart}/quiz`}
                          >
                            Quiz this week
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
        <CardDetailDialog
          card={openCard}
          onClose={() => setOpenCard(null)}
        />
      </AppShell>
    </StoreReady>
  )
}
