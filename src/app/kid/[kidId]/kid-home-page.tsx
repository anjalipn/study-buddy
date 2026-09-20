"use client"

import { use, useEffect } from "react"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { AvatarBadge } from "@/components/avatar-badge"
import { EmptyState } from "@/components/empty-state"
import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  deckProgress,
  decksForYear,
  getKid,
  getSubject,
  yearLabel,
} from "@/lib/selectors"
import { useStore } from "@/lib/store"

export function KidHomePage({
  params,
}: {
  params: Promise<{ kidId: string }>
}) {
  const { kidId } = use(params)
  const { data, loginKid } = useStore()
  const kid = getKid(data, kidId)

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

  const decks = decksForYear(data, kid.year)

  return (
    <StoreReady>
      <AppShell
        title={`Hello, ${kid.name}`}
        eyebrow={yearLabel(kid.year)}
        backHref="/"
        backLabel="Switch person"
        actions={<AvatarBadge avatar={kid.avatar} size="md" />}
      >
        <p className="text-base leading-7 text-muted-foreground">
          Choose a deck to practise. Year cards are shared; you can add extra
          cards of your own.
        </p>

        {decks.length === 0 ? (
          <EmptyState
            title="No subjects yet"
            description="Ask a parent to add a subject. Then you will see a deck for your year."
          />
        ) : (
          <ul className="grid gap-3">
            {decks.map((deck) => {
              const subject = getSubject(data, deck.subjectId)
              const progress = deckProgress(data, kid.id, deck.id)
              const percent =
                progress.total === 0
                  ? 0
                  : Math.round((progress.known / progress.total) * 100)
              return (
                <li key={deck.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-4 px-5 py-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary">
                            {subject?.name ?? "Subject"}
                          </p>
                          <h2 className="font-heading text-xl font-semibold">
                            {deck.title}
                          </h2>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {progress.total === 0
                            ? "No cards yet"
                            : `${progress.known} of ${progress.total} known`}
                        </p>
                      </div>
                      <Progress value={percent} className="h-2" />
                      <div className="flex flex-col gap-2 sm:flex-row">
                        {progress.total === 0 ? (
                          <Button
                            className="h-12 flex-1 px-5 text-base"
                            disabled
                          >
                            Study
                          </Button>
                        ) : (
                          <Button
                            asChild
                            className="h-12 flex-1 px-5 text-base"
                          >
                            <Link href={`/kid/${kid.id}/study/${deck.id}`}>
                              Study
                            </Link>
                          </Button>
                        )}
                        <Button
                          asChild
                          variant="outline"
                          className="h-12 flex-1 px-5 text-base"
                        >
                          <Link href={`/kid/${kid.id}/deck/${deck.id}`}>
                            Cards
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </AppShell>
    </StoreReady>
  )
}
