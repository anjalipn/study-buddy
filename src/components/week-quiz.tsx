"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Flashcard } from "@/lib/types"

const FILLERS = [
  "a kind of garden tool",
  "to hop across a puddle",
  "a bright colour on a wall",
  "the sound a kettle makes",
]

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function meaning(card: Flashcard): string {
  return card.word?.definitions[0] ?? card.back.split("\n")[0] ?? card.back
}

type Question = {
  card: Flashcard
  options: string[]
  answer: string
}

function buildQuestions(
  weekCards: Flashcard[],
  bank: Flashcard[],
): Question[] {
  return shuffle(weekCards).map((card) => {
    const answer = meaning(card)
    const others = shuffle(
      bank
        .filter((item) => item.id !== card.id)
        .map(meaning)
        .filter((item) => item && item !== answer),
    )
    const extra = FILLERS.filter((item) => item !== answer)
    const options = shuffle(
      [answer, ...others, ...extra].filter(Boolean).slice(0, 4),
    )
    if (!options.includes(answer)) options[0] = answer
    return { card, options: shuffle(options), answer }
  })
}

export function WeekQuiz({
  weekCards,
  bank,
  title,
  closeHref,
}: {
  weekCards: Flashcard[]
  bank: Flashcard[]
  title: string
  closeHref: string
}) {
  const [round, setRound] = useState(0)
  const questions = useMemo(() => {
    void round
    return buildQuestions(weekCards, bank)
  }, [bank, round, weekCards])
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const question = questions[index]
  const percent =
    questions.length === 0
      ? 0
      : Math.round(((done ? questions.length : index) / questions.length) * 100)

  function pick(option: string) {
    if (chosen || !question) return
    setChosen(option)
    if (option === question.answer) setScore((value) => value + 1)
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true)
      return
    }
    setIndex((value) => value + 1)
    setChosen(null)
  }

  function restart() {
    setRound((value) => value + 1)
    setIndex(0)
    setChosen(null)
    setScore(0)
    setDone(false)
  }

  if (weekCards.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="font-heading text-xl font-semibold">No words to quiz</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Add words to this week first, then come back for a quiz.
        </p>
        <Button asChild className="mt-6 h-12 px-5 text-base">
          <Link href={closeHref}>Back to weekly words</Link>
        </Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Quiz finished</h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          You got {score} of {questions.length} right for {title}.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button className="h-14 px-5 text-base" onClick={restart}>
            Try the quiz again
          </Button>
          <Button asChild variant="outline" className="h-14 px-5 text-base">
            <Link href={closeHref}>Back to weekly words</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="mt-8 flex flex-1 flex-col">
      <Progress value={percent} className="h-2" />
      <p className="mt-3 text-sm text-muted-foreground">
        {index + 1} of {questions.length}
      </p>
      <p className="mt-6 text-sm font-medium text-primary">What does this mean?</p>
      <p className="mt-2 font-heading text-4xl font-semibold">{question.card.front}</p>
      <div className="mt-8 grid gap-3">
        {question.options.map((option) => {
          const selected = chosen === option
          const correct = option === question.answer
          return (
            <Button
              key={option}
              variant="outline"
              className={cn(
                "h-auto min-h-14 justify-start whitespace-normal px-4 py-3 text-left text-base",
                chosen && correct && "border-emerald-700 bg-emerald-50",
                selected && !correct && "border-destructive bg-destructive/10",
              )}
              onClick={() => pick(option)}
              disabled={Boolean(chosen)}
            >
              {option}
            </Button>
          )
        })}
      </div>
      {chosen ? (
        <Button className="mt-8 h-14 text-base" onClick={next}>
          {index + 1 >= questions.length ? "See results" : "Next word"}
        </Button>
      ) : null}
    </div>
  )
}
