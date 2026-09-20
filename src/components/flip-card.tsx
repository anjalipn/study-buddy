"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import type { WordDetails } from "@/lib/types"

export function FlipCard({
  front,
  back,
  word,
  flipped,
  onFlip,
}: {
  front: string
  back: string
  word?: WordDetails
  flipped: boolean
  onFlip: () => void
}) {
  const detailed = Boolean(word) || back.includes("\n")

  return (
    <button
      type="button"
      onClick={onFlip}
      className="block w-full text-left"
      aria-pressed={flipped}
    >
      <span className="sr-only">
        {flipped ? "Show the front of the card" : "Show the answer"}
      </span>
      <div className="[perspective:1200px]">
        <div
          className={cn(
            "relative min-h-[280px] w-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] sm:min-h-[360px]",
            detailed && "min-h-[420px] sm:min-h-[460px]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <CardFace label="Front" detailed={false}>
            <p className="flex flex-1 items-center justify-center text-center font-heading text-3xl leading-snug font-semibold sm:text-4xl">
              {front}
            </p>
            {word ? (
              <p className="text-center text-sm text-muted-foreground">
                {word.partsOfSpeech.join(" · ")} · Level {word.level}
              </p>
            ) : null}
          </CardFace>
          <CardFace label="Back" detailed={detailed} back>
            {word ? (
              <WordBack word={word} />
            ) : (
              <p
                className={cn(
                  "flex flex-1 whitespace-pre-wrap",
                  detailed
                    ? "text-left text-base leading-6"
                    : "items-center justify-center text-center font-heading text-3xl leading-snug font-semibold sm:text-4xl",
                )}
              >
                {back}
              </p>
            )}
          </CardFace>
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Tap the card to flip it
      </p>
    </button>
  )
}

function CardFace({
  label,
  children,
  back = false,
  detailed,
}: {
  label: string
  children: ReactNode
  back?: boolean
  detailed: boolean
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col rounded-3xl bg-card px-5 py-6 shadow-lg ring-1 ring-foreground/10 [backface-visibility:hidden] sm:px-6 sm:py-8",
        back && "[transform:rotateY(180deg)]",
        detailed && "overflow-y-auto",
      )}
    >
      <span className="text-sm font-medium tracking-wide text-primary uppercase">
        {label}
      </span>
      <div className="mt-4 flex flex-1 flex-col gap-3">{children}</div>
    </div>
  )
}

function WordBack({ word }: { word: WordDetails }) {
  return (
    <div className="flex flex-col gap-4 text-left text-sm leading-6">
      <p className="text-muted-foreground">
        {word.partsOfSpeech.join(", ")} · Level {word.level} ({word.band})
        {word.theme
          ? ` · ${word.theme.name}: ${word.theme.values.join(", ")}`
          : ""}
      </p>
      <section>
        <h3 className="font-semibold">Definitions</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {word.definitions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {word.usageContext ? (
        <section>
          <h3 className="font-semibold">Usage</h3>
          <p className="mt-1">{word.usageContext}</p>
        </section>
      ) : null}
      {word.synonyms.length > 0 ? (
        <section>
          <h3 className="font-semibold">Synonyms</h3>
          <p className="mt-1">{word.synonyms.join(", ")}</p>
        </section>
      ) : null}
      {word.antonyms.length > 0 ? (
        <section>
          <h3 className="font-semibold">Antonyms</h3>
          <p className="mt-1">{word.antonyms.join(", ")}</p>
        </section>
      ) : null}
      {word.additionalInfo ? <p>{word.additionalInfo}</p> : null}
      {word.examples.length > 0 ? (
        <section>
          <h3 className="font-semibold">Examples</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {word.examples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
