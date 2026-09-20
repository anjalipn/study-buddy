"use client"

import type { ReactNode } from "react"

import { VocabularyCard } from "@/components/vocabulary-card"
import { cn } from "@/lib/utils"
import type { WordDetails } from "@/lib/types"

export function FlipCard({
  front,
  back,
  word,
  addedOn,
  flipped,
  onFlip,
}: {
  front: string
  back: string
  word?: WordDetails
  addedOn?: string
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
            word && "min-h-[520px] sm:min-h-[560px]",
            detailed && !word && "min-h-[420px] sm:min-h-[460px]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <CardFace label={word ? undefined : "Front"} detailed={false}>
            <p className="flex flex-1 items-center justify-center text-center font-heading text-3xl leading-snug font-semibold sm:text-5xl">
              {front}
            </p>
            {word ? (
              <p className="text-center text-sm text-muted-foreground">
                {word.partsOfSpeech.join(" · ")} · Level {word.level}
                {addedOn ? ` · Added ${addedOn}` : ""}
              </p>
            ) : addedOn ? (
              <p className="text-center text-sm text-muted-foreground">
                Added {addedOn}
              </p>
            ) : null}
          </CardFace>
          <CardFace
            label={word ? undefined : "Back"}
            detailed={detailed}
            back
            flush={Boolean(word)}
          >
            {word ? (
              <VocabularyCard term={front} word={word} addedOn={addedOn} />
            ) : (
              <>
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
                {addedOn ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Added {addedOn}
                  </p>
                ) : null}
              </>
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
  flush = false,
}: {
  label?: string
  children: ReactNode
  back?: boolean
  detailed: boolean
  flush?: boolean
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col rounded-3xl bg-card shadow-lg ring-1 ring-foreground/10 [backface-visibility:hidden]",
        flush ? "overflow-y-auto p-0" : "px-5 py-6 sm:px-6 sm:py-8",
        back && "[transform:rotateY(180deg)]",
        detailed && "overflow-y-auto",
      )}
    >
      {label ? (
        <span className="px-0 text-sm font-medium tracking-wide text-primary uppercase">
          {label}
        </span>
      ) : null}
      <div className={cn("flex flex-1 flex-col", !flush && "mt-4 gap-3")}>
        {children}
      </div>
    </div>
  )
}
