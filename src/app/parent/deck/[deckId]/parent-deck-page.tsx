"use client"

import { use, useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { CardFormDialog } from "@/components/card-form-dialog"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState } from "@/components/empty-state"
import { ParentGate } from "@/components/parent-gate"
import { ErrorScreen } from "@/components/error-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDeck, getSubject, sharedCards, yearLabel } from "@/lib/selectors"
import { useStore } from "@/lib/store"
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
  const title = draftTitle ?? deck?.title ?? ""

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

        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Year cards</h2>
          <Button className="h-12 px-5 text-base" onClick={() => setForm("new")}>
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
          <ul className="flex flex-col gap-3">
            {cards.map((card) => (
              <li key={card.id}>
                <Card>
                  <CardContent className="flex flex-col gap-4 px-5 py-0 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Front
                      </p>
                      <p className="text-lg font-medium">{card.front}</p>
                      <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Back
                      </p>
                      <p className="text-base text-muted-foreground">
                        {card.back}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="h-11"
                        onClick={() => setForm(card)}
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <ConfirmDelete
                        triggerLabel="Delete"
                        title="Delete this card?"
                        description="Children will no longer see it in this year deck."
                        onConfirm={() => {
                          deleteCard(card.id)
                          toast.success("Card deleted")
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </AppShell>

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
          } else {
            addCard({ ...input, deckId: deck.id, kidId: null })
            toast.success("Card added to the year deck")
          }
        }}
      />
    </ParentGate>
  )
}
