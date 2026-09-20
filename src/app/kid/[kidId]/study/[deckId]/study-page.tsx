"use client"

import { use, useEffect, useMemo } from "react"

import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { StudySession } from "@/components/study-session"
import {
  getDeck,
  getKid,
  getSubject,
  studyCards,
  yearLabel,
} from "@/lib/selectors"
import { useStore } from "@/lib/store"

export function StudyPage({
  params,
}: {
  params: Promise<{ kidId: string; deckId: string }>
}) {
  const { kidId, deckId } = use(params)
  const { data, loginKid } = useStore()
  const kid = getKid(data, kidId)
  const deck = getDeck(data, deckId)
  const subject = deck ? getSubject(data, deck.subjectId) : undefined
  const cards = useMemo(
    () => (kid && deck ? studyCards(data, deck.id, kid.id) : []),
    [data, deck, kid],
  )

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
      <StudySession
        kidId={kid.id}
        cards={cards}
        title={deck.title}
        eyebrow={`${subject.name} · ${yearLabel(kid.year)}`}
        closeHref={`/kid/${kid.id}`}
        empty={{
          title: "Nothing to study yet",
          description:
            "Add a personal card, or ask a parent to fill this year deck.",
          href: `/kid/${kid.id}/deck/${deck.id}`,
          label: "Go to cards",
        }}
      />
    </StoreReady>
  )
}
