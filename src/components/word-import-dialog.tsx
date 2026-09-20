"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { detailsFromForm, parseXlWordPaste } from "@/lib/parse-xl-words"
import { useStore } from "@/lib/store"

const emptyForm = {
  term: "",
  partsOfSpeech: "",
  level: "",
  band: "Intermediate",
  themeName: "",
  themeValues: "",
  definitions: "",
  usageContext: "",
  synonyms: "",
  antonyms: "",
  additionalInfo: "",
  examples: "",
}

export function WordImportDialog({
  open,
  onOpenChange,
  deckId,
  kidId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  kidId: string | null
}) {
  const { addWordCards } = useStore()
  const [paste, setPaste] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const parsed = useMemo(() => parseXlWordPaste(paste), [paste])
  const preview = paste.trim() ? parsed : { words: [], error: null }

  function addParsed(
    words: { term: string; details: (typeof parsed.words)[number]["details"] }[],
  ) {
    const { added, skipped } = addWordCards(
      words.map((word) => ({
        deckId,
        kidId,
        term: word.term,
        details: word.details,
      })),
    )
    if (added === 0 && skipped === 0) {
      toast.error("Nothing was added.")
      return
    }
    toast.success(
      skipped > 0
        ? `Added ${added} word${added === 1 ? "" : "s"}. Skipped ${skipped} already in this deck.`
        : `Added ${added} word${added === 1 ? "" : "s"}.`,
    )
    setPaste("")
    setForm(emptyForm)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add words</DialogTitle>
          <DialogDescription>
            Paste one or many cards copied from XL Education, or type a single
            word with the same fields. Scraping the XL site needs a login, so
            paste is the way to bulk-add for now.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="paste">
          <TabsList className="h-11">
            <TabsTrigger value="paste" className="px-4">
              Paste cards
            </TabsTrigger>
            <TabsTrigger value="type" className="px-4">
              Type one
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste" className="mt-4 space-y-3">
            <Label htmlFor="xl-paste">XL word cards</Label>
            <Textarea
              id="xl-paste"
              value={paste}
              onChange={(event) => setPaste(event.target.value)}
              placeholder="Paste darkly, boredom, and any others here — one after another."
              className="min-h-48 font-mono text-sm"
            />
            {preview.error && paste.trim() ? (
              <p className="text-sm text-destructive" role="alert">
                {preview.error}
              </p>
            ) : null}
            {preview.words.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Ready to add: {preview.words.map((word) => word.term).join(", ")}
              </p>
            ) : null}
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-11"
                disabled={preview.words.length === 0}
                onClick={() => addParsed(preview.words)}
              >
                Add {preview.words.length || ""} word
                {preview.words.length === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="type" className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Word"
                value={form.term}
                onChange={(value) => setForm({ ...form, term: value })}
              />
              <Field
                label="Part of speech"
                value={form.partsOfSpeech}
                onChange={(value) => setForm({ ...form, partsOfSpeech: value })}
                placeholder="adverb, or verb, noun"
              />
              <Field
                label="Level"
                value={form.level}
                onChange={(value) => setForm({ ...form, level: value })}
                placeholder="6"
              />
              <Field
                label="Band"
                value={form.band}
                onChange={(value) => setForm({ ...form, band: value })}
              />
              <Field
                label="Theme name"
                value={form.themeName}
                onChange={(value) => setForm({ ...form, themeName: value })}
                placeholder="emotion"
              />
              <Field
                label="Theme tags"
                value={form.themeValues}
                onChange={(value) => setForm({ ...form, themeValues: value })}
                placeholder="shadowy, ominous"
              />
            </div>
            <Area
              label="Definitions (one per line)"
              value={form.definitions}
              onChange={(value) => setForm({ ...form, definitions: value })}
            />
            <Area
              label="Usage context"
              value={form.usageContext}
              onChange={(value) => setForm({ ...form, usageContext: value })}
            />
            <Area
              label="Synonyms"
              value={form.synonyms}
              onChange={(value) => setForm({ ...form, synonyms: value })}
            />
            <Area
              label="Antonyms"
              value={form.antonyms}
              onChange={(value) => setForm({ ...form, antonyms: value })}
            />
            <Area
              label="Additional info"
              value={form.additionalInfo}
              onChange={(value) => setForm({ ...form, additionalInfo: value })}
            />
            <Area
              label="Example sentences (one per line)"
              value={form.examples}
              onChange={(value) => setForm({ ...form, examples: value })}
            />
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <DialogFooter className="mx-0 mb-0 border-0 bg-transparent p-0">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-11"
                onClick={() => {
                  const word = detailsFromForm(form)
                  if (!word) {
                    setFormError(
                      "Need a word, part of speech, level, and at least one definition.",
                    )
                    return
                  }
                  setFormError(null)
                  addParsed([word])
                }}
              >
                Add word
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        className="h-11 text-base"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-")
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        className="min-h-20 text-base"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
