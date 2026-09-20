"use client"

import { use, useEffect } from "react"
import Link from "next/link"

import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { WeekQuiz } from "@/components/week-quiz"
import { Button } from "@/components/ui/button"
import { getKid } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import {
  vocabWordsForKid,
  weekLabel,
  weeklyWordLists,
} from "@/lib/weeks"

export function WeeklyQuizPage({
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

  const allWords = vocabWordsForKid(data, kid)
  const week = weeklyWordLists(allWords).find(
    (item) => item.weekStart === weekStart,
  )
  const label = week?.label ?? weekLabel(weekStart)

  return (
    <StoreReady>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 sm:px-6">
        <Button variant="ghost" asChild className="-ml-2 h-11 w-fit px-2 text-base">
          <Link href={`/kid/${kid.id}/weekly`}>Close</Link>
        </Button>
        <p className="mt-4 text-sm font-medium text-primary">Weekly quiz</p>
        <h1 className="font-heading text-2xl font-semibold">{label}</h1>
        <WeekQuiz
          weekCards={week?.cards ?? []}
          bank={allWords}
          title={label}
          closeHref={`/kid/${kid.id}/weekly`}
        />
      </div>
    </StoreReady>
  )
}
