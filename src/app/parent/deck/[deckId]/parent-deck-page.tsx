"use client"

import { use, useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { CardDetailDialog } from "@/components/card-detail-dialog"
import { CardFormDialog } from "@/components/card-form-dialog"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState } from "@/components/empty-state"
import { FrontOnlyList } from "@/components/front-only-list"
import { ParentGate } from "@/components/parent-gate"
import { ErrorScreen } from "@/components/error-screen"
import { WordNotebook } from "@/components/word-notebook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDeck, getSubject, sharedCards, yearLabel } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import { isVocabularyDeck } from "@/lib/word-index"
import type { Flashcard } from "@/lib/types"

export function ParentDeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = use(params)
  const { data, updateDeckTitle, addCard, updateCard, deleteCard } = useStore()
  const deck = getDeck(data, deckId)
  const subject = deck ? getSubject(data, deck.subjectId) : undefined
  const cards = deck ? sharedCards(data, deck.id) : []
  const [draftTitle, setDraftTitle] = useState<string | null>(null)
  const [form, setForm] = useState<Flashcard | "new" | null>(null)
  const [openCard, setOpenCard] = useState<Flashcard | null>(null)
  const title = draftTitle ?? deck?.title ?? ""
  const vocab = isVocabularyDeck(cards)

  if (!deck || !subject) {
    return (
      <ParentGate>
        <ErrorScreen
          title="Deck not found"
          description="This year deck is missing. It may have been deleted with its subject."
        />
      </ParentGate>
    )
  }

  return (
    <ParentGate>
      <AppShell
        title={deck.title}
        eyebrow={`${subject.name} · ${yearLabel(deck.year)}`}
        backHref="/parent"
        backLabel="Subjects"
      >
        <div className="grid gap-2">
          <Label htmlFor="deck-title">Deck name</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="deck-title"
              value={title}
              onChange={(event) => setDraftTitle(event.target.value)}
              className="h-12 text-base"
              maxLength={48}
            />
            <Button
              className="h-12 px-5"
              onClick={() => {
                const next = title.trim()
                if (!next) {
                  toast.error("Give the deck a name.")
                  return
                }
                updateDeckTitle(deck.id, next)
                setDraftTitle(null)
                toast.success("Deck name saved")
              }}
            >
              Save name
            </Button>
          </div>
        </div>

        {vocab ? (
          <WordNotebook
            cards={cards}
            onOpen={setOpenCard}
            extra={
              <div className="flex justify-end">
                <Button
                  className="h-12 px-5 text-base"
                  onClick={() => setForm("new")}
                >
                  <Plus className="size-4" />
                  Add card
                </Button>
              </div>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-semibold">Year cards</h2>
              <Button
                className="h-12 px-5 text-base"
                onClick={() => setForm("new")}
              >
                <Plus className="size-4" />
                Add card
              </Button>
            </div>
            {cards.length === 0 ? (
              <EmptyState
                title="This deck is empty"
                description={`Add shared cards for ${yearLabel(deck.year)} ${subject.name}. Children in that year will see them, and can still add their own cards on top.`}
              />
            ) : (
              <FrontOnlyList cards={cards} onOpen={setOpenCard} />
            )}
          </>
        )}
      </AppShell>

      <CardDetailDialog
        card={openCard}
        onClose={() => setOpenCard(null)}
        actions={
          openCard ? (
            <>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setForm(openCard)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
              <ConfirmDelete
                triggerLabel="Delete"
                title="Delete this card?"
                description="Children will no longer see it in this year deck."
                onConfirm={() => {
                  deleteCard(openCard.id)
                  setOpenCard(null)
                  toast.success("Card deleted")
                }}
              />
            </>
          ) : undefined
        }
      />

      <CardFormDialog
        key={form === "new" ? "new" : form?.id}
        open={form !== null}
        onOpenChange={(open) => {
          if (!open) setForm(null)
        }}
        title={form && form !== "new" ? "Edit year card" : "Add a year card"}
        description="Everyone in this year sees these cards. Personal cards stay private to each child."
        initial={form && form !== "new" ? form : undefined}
        onSubmit={(input) => {
          if (form && form !== "new") {
            updateCard(form.id, input)
            toast.success("Card updated")
            setOpenCard((current) =>
              current && current.id === form.id
                ? { ...current, ...input }
                : current,
            )
          } else {
            addCard({ ...input, deckId: deck.id, kidId: null })
            toast.success("Card added to the year deck")
          }
        }}
      />
    </ParentGate>
  )
}
