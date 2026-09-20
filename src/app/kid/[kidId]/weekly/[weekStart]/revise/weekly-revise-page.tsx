"use client"

import { use, useEffect } from "react"

import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { StudySession } from "@/components/study-session"
import { getKid } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import {
  vocabWordsForKid,
  weekLabel,
  weeklyWordLists,
} from "@/lib/weeks"

export function WeeklyRevisePage({
  params,
}: {
  params: Promise<{ kidId: string; weekStart: string }>
}) {
  const { kidId, weekStart } = use(params)
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

  const week = weeklyWordLists(vocabWordsForKid(data, kid)).find(
    (item) => item.weekStart === weekStart,
  )
  const label = week?.label ?? weekLabel(weekStart)

  return (
    <StoreReady>
      <StudySession
        kidId={kid.id}
        cards={week?.cards ?? []}
        title={`Revise · ${label}`}
        eyebrow="Weekly words"
        closeHref={`/kid/${kid.id}/weekly`}
        empty={{
          title: "No words in this week",
          description: "Pick another week, or add words and they will show here.",
          href: `/kid/${kid.id}/weekly`,
          label: "Back to weekly words",
        }}
      />
    </StoreReady>
  )
}
