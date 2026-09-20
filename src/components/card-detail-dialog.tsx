"use client"

import type { ReactNode } from "react"

import { VocabularyCard } from "@/components/vocabulary-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Flashcard } from "@/lib/types"

export function CardDetailDialog({
  card,
  onClose,
  actions,
}: {
  card: Flashcard | null
  onClose: () => void
  actions?: ReactNode
}) {
  return (
    <Dialog open={card !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-4xl"
        showCloseButton
      >
        {card ? (
          card.word ? (
            <>
              <DialogTitle className="sr-only">{card.front}</DialogTitle>
              <DialogDescription className="sr-only">
                Full word card
              </DialogDescription>
              <VocabularyCard term={card.front} word={card.word} />
            </>
          ) : (
            <div className="px-6 py-8">
              <DialogHeader>
                <DialogTitle className="font-heading text-3xl">
                  {card.front}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Back of the card
                </DialogDescription>
              </DialogHeader>
              <p className="mt-6 whitespace-pre-wrap text-lg leading-8">
                {card.back}
              </p>
            </div>
          )
        ) : null}
        {actions ? (
          <div className="flex flex-wrap gap-2 border-t px-5 py-4">{actions}</div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
