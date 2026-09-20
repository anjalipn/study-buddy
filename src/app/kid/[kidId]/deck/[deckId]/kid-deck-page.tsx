"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { CardFormDialog } from "@/components/card-form-dialog"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState } from "@/components/empty-state"
import { ErrorScreen } from "@/components/error-screen"
import { StoreReady } from "@/components/store-ready"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getDeck,
  getKid,
  getSubject,
  personalCards,
  sharedCards,
  studyCards,
  yearLabel,
} from "@/lib/selectors"
import { useStore } from "@/lib/store"
import type { Flashcard } from "@/lib/types"

export function KidDeckPage({
  params,
}: {
  params: Promise<{ kidId: string; deckId: string }>
}) {
  const { kidId, deckId } = use(params)
  const { data, loginKid, addCard, updateCard, deleteCard } = useStore()
  const kid = getKid(data, kidId)
  const deck = getDeck(data, deckId)
  const subject = deck ? getSubject(data, deck.subjectId) : undefined
  const [form, setForm] = useState<Flashcard | "new" | null>(null)

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
          description="This deck is not available for this year. Go back and pick another one."
        />
      </StoreReady>
    )
  }

  const shared = sharedCards(data, deck.id)
  const personal = personalCards(data, deck.id, kid.id)
  const total = studyCards(data, deck.id, kid.id).length

  return (
    <StoreReady>
      <AppShell
        title={deck.title}
        eyebrow={`${subject.name} · ${yearLabel(kid.year)}`}
        backHref={`/kid/${kid.id}`}
        backLabel="Decks"
        actions={
          total === 0 ? (
            <Button className="h-11 px-4" disabled>
              Study
            </Button>
          ) : (
            <Button asChild className="h-11 px-4">
              <Link href={`/kid/${kid.id}/study/${deck.id}`}>Study</Link>
            </Button>
          )
        }
      >
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-semibold">Year cards</h2>
          {shared.length === 0 ? (
            <EmptyState
              title="No year cards yet"
              description={`Ask a parent to add ${yearLabel(kid.year)} ${subject.name} cards, or add your own below.`}
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {shared.map((card) => (
                <li key={card.id}>
                  <Card>
                    <CardContent className="px-5 py-1">
                      <p className="text-lg font-medium">{card.front}</p>
                      <p className="text-sm text-muted-foreground">
                        {card.back}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-semibold">My cards</h2>
            <Button
              className="h-12 px-5 text-base"
              onClick={() => setForm("new")}
            >
              <Plus className="size-4" />
              Add my card
            </Button>
          </div>
          {personal.length === 0 ? (
            <EmptyState
              title="You have not added cards yet"
              description="Your cards sit on top of the year deck. Only you will see them when you study."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {personal.map((card) => (
                <li key={card.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-4 px-5 py-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-medium">{card.front}</p>
                        <p className="text-sm text-muted-foreground">
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
                          title="Delete your card?"
                          description="This only removes your card. The year deck stays as it is."
                          onConfirm={() => {
                            deleteCard(card.id)
                            toast.success("Your card was deleted")
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AppShell>

      <CardFormDialog
        key={form === "new" ? "new" : form?.id}
        open={form !== null}
        onOpenChange={(open) => {
          if (!open) setForm(null)
        }}
        title={form && form !== "new" ? "Edit your card" : "Add your card"}
        description="These cards are just for you. They are mixed into this deck when you study."
        initial={form && form !== "new" ? form : undefined}
        onSubmit={(input) => {
          if (form && form !== "new") {
            updateCard(form.id, input)
            toast.success("Card updated")
          } else {
            addCard({ ...input, deckId: deck.id, kidId: kid.id })
            toast.success("Your card was added")
          }
        }}
      />
    </StoreReady>
  )
}
