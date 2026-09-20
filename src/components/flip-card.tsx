"use client"

import { cn } from "@/lib/utils"

export function FlipCard({
  front,
  back,
  flipped,
  onFlip,
}: {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
}) {
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
            "relative min-h-[280px] w-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] sm:min-h-[320px]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <CardFace label="Front" text={front} />
          <CardFace label="Back" text={back} back />
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
  text,
  back = false,
}: {
  label: string
  text: string
  back?: boolean
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col rounded-3xl bg-card px-6 py-8 shadow-lg ring-1 ring-foreground/10 [backface-visibility:hidden]",
        back && "[transform:rotateY(180deg)]",
      )}
    >
      <span className="text-sm font-medium tracking-wide text-primary uppercase">
        {label}
      </span>
      <p className="mt-6 flex flex-1 items-center justify-center text-center font-heading text-3xl leading-snug font-semibold sm:text-4xl">
        {text}
      </p>
    </div>
  )
}
