"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CardFormDialog({
  open,
  onOpenChange,
  title,
  description,
  initial,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  initial?: { front: string; back: string }
  onSubmit: (input: { front: string; back: string }) => void
}) {
  const [front, setFront] = useState(initial?.front ?? "")
  const [back, setBack] = useState(initial?.back ?? "")
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setFront(initial?.front ?? "")
      setBack(initial?.back ?? "")
      setError(null)
    }
    onOpenChange(next)
  }

  function submit() {
    const nextFront = front.trim()
    const nextBack = back.trim()
    if (!nextFront || !nextBack) {
      setError("Add something on both sides of the card.")
      return
    }
    onSubmit({ front: nextFront, back: nextBack })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="card-front">Front</Label>
            <Textarea
              id="card-front"
              value={front}
              onChange={(event) => setFront(event.target.value)}
              placeholder="The prompt, sum, or word"
              className="min-h-24 text-base"
              maxLength={200}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="card-back">Back</Label>
            <Textarea
              id="card-back"
              value={back}
              onChange={(event) => setBack(event.target.value)}
              placeholder="The answer"
              className="min-h-24 text-base"
              maxLength={200}
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="h-11" onClick={submit}>
            Save card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
