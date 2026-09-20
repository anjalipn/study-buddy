"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Pencil, Plus } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { AvatarBadge } from "@/components/avatar-badge"
import { ConfirmDelete } from "@/components/confirm-delete"
import { EmptyState } from "@/components/empty-state"
import { KidFormDialog } from "@/components/kid-form-dialog"
import { ParentGate } from "@/components/parent-gate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PinPad } from "@/components/pin-pad"
import { getAvatar } from "@/lib/avatars"
import { isPin, sharedCards, yearLabel } from "@/lib/selectors"
import { useStore } from "@/lib/store"
import { SCHOOL_YEARS, type Kid, type Subject } from "@/lib/types"

export function ParentHome() {
  const {
    data,
    logout,
    addKid,
    updateKid,
    deleteKid,
    addSubject,
    updateSubject,
    deleteSubject,
    setPin,
    resetDevice,
    mode,
    signOutDevice,
  } = useStore()
  const [kidDialog, setKidDialog] = useState<Kid | "new" | null>(null)
  const [subjectDialog, setSubjectDialog] = useState<Subject | "new" | null>(
    null,
  )
  const [subjectName, setSubjectName] = useState("")
  const [subjectError, setSubjectError] = useState<string | null>(null)
  const [pinStep, setPinStep] = useState<"idle" | "create" | "confirm">("idle")
  const [pinDigits, setPinDigits] = useState("")
  const [pendingPin, setPendingPin] = useState("")
  const [pinMessage, setPinMessage] = useState<string | null>(null)

  async function handlePin(next: string) {
    setPinDigits(next)
    setPinMessage(null)
    if (!isPin(next)) return
    if (pinStep === "create") {
      setPendingPin(next)
      setPinDigits("")
      setPinStep("confirm")
      return
    }
    if (next !== pendingPin) {
      setPinMessage("Those PINs did not match. Try again.")
      setPinDigits("")
      setPendingPin("")
      setPinStep("create")
      return
    }
    try {
      await setPin(next)
      setPinStep("idle")
      setPinDigits("")
      setPendingPin("")
      toast.success(mode === "db" ? "Family PIN updated" : "Parent PIN updated")
    } catch (cause) {
      setPinMessage(
        cause instanceof Error ? cause.message : "Could not save that PIN.",
      )
      setPinDigits("")
    }
  }

  return (
    <ParentGate>
      <AppShell
        title="Parent settings"
        eyebrow="Study Buddy"
        backHref="/"
        backLabel="Profiles"
        actions={
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              logout()
            }}
          >
            Lock
          </Button>
        }
      >
        <Tabs defaultValue="children">
          <TabsList className="h-12 w-full sm:w-auto">
            <TabsTrigger value="children" className="px-4 text-base">
              Children
            </TabsTrigger>
            <TabsTrigger value="decks" className="px-4 text-base">
              Subjects
            </TabsTrigger>
            <TabsTrigger value="device" className="px-4 text-base">
              Device
            </TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="mt-6">
            {data.kids.length === 0 ? (
              <EmptyState
                title="Add the first child"
                description="Give them a name, school year, and avatar. They will pick that profile from the home screen — no password."
                action={
                  <Button
                    className="h-12 px-5 text-base"
                    onClick={() => setKidDialog("new")}
                  >
                    <Plus className="size-4" />
                    Add a child
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Button
                    className="h-12 px-5 text-base"
                    onClick={() => setKidDialog("new")}
                  >
                    <Plus className="size-4" />
                    Add a child
                  </Button>
                </div>
                {data.kids.map((kid) => (
                  <Card key={kid.id}>
                    <CardContent className="flex flex-col gap-4 px-5 py-0 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <AvatarBadge avatar={kid.avatar} />
                        <div>
                          <p className="font-heading text-lg font-semibold">
                            {kid.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {yearLabel(kid.year)} · {getAvatar(kid.avatar).label}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="h-11"
                          onClick={() => setKidDialog(kid)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Button>
                        <ConfirmDelete
                          triggerLabel="Remove"
                          title={`Remove ${kid.name}?`}
                          description="Their profile, personal cards, and study marks will be deleted on this device. Shared year decks stay."
                          confirmLabel="Remove child"
                          onConfirm={() => {
                            deleteKid(kid.id)
                            toast.success(`${kid.name} was removed`)
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="decks" className="mt-6 space-y-6">
            <div className="flex justify-end">
              <Button
                className="h-12 px-5 text-base"
                onClick={() => {
                  setSubjectName("")
                  setSubjectError(null)
                  setSubjectDialog("new")
                }}
              >
                <Plus className="size-4" />
                Add a subject
              </Button>
            </div>
            {data.subjects.length === 0 ? (
              <EmptyState
                title="No subjects yet"
                description="Add a subject to create empty Year 1–4 decks you can fill with cards."
              />
            ) : (
              data.subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardHeader className="flex-row items-start justify-between gap-3">
                    <CardTitle className="text-xl">{subject.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="h-11"
                        onClick={() => {
                          setSubjectName(subject.name)
                          setSubjectError(null)
                          setSubjectDialog(subject)
                        }}
                      >
                        Rename
                      </Button>
                      <ConfirmDelete
                        triggerLabel="Delete"
                        title={`Delete ${subject.name}?`}
                        description="This removes the subject and every year deck and card inside it, including children’s personal cards for those decks."
                        onConfirm={() => {
                          deleteSubject(subject.id)
                          toast.success(`${subject.name} was deleted`)
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2">
                    {SCHOOL_YEARS.map((year) => {
                      const deck = data.decks.find(
                        (item) =>
                          item.subjectId === subject.id && item.year === year,
                      )
                      if (!deck) return null
                      const count = sharedCards(data, deck.id).length
                      return (
                        <Link
                          key={deck.id}
                          href={`/parent/deck/${deck.id}`}
                          className="flex items-center justify-between rounded-xl bg-muted/70 px-4 py-4 text-left hover:bg-muted"
                        >
                          <span>
                            <span className="block font-medium">
                              {yearLabel(year)}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {deck.title}
                            </span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count === 0
                              ? "Empty"
                              : `${count} card${count === 1 ? "" : "s"}`}
                          </span>
                        </Link>
                      )
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="device" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change parent PIN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pinStep === "idle" ? (
                  <Button
                    className="h-12 px-5 text-base"
                    onClick={() => {
                      setPinStep("create")
                      setPinDigits("")
                      setPendingPin("")
                      setPinMessage(null)
                    }}
                  >
                    Set a new PIN
                  </Button>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {pinStep === "create"
                        ? "Enter a new four-digit PIN."
                        : "Enter the new PIN once more."}
                    </p>
                    <PinPad
                      value={pinDigits}
                      onChange={(value) => void handlePin(value)}
                      ariaLabel="New parent PIN"
                    />
                    {pinMessage ? (
                      <p className="text-sm text-destructive" role="alert">
                        {pinMessage}
                      </p>
                    ) : null}
                    <Button
                      variant="ghost"
                      className="h-11"
                      onClick={() => {
                        setPinStep("idle")
                        setPinDigits("")
                        setPendingPin("")
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  {mode === "db" ? "Shared database" : "This device"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {mode === "db"
                    ? "Words, children, and progress are stored in Neon Postgres. This browser keeps a signed-in cookie after you enter the family PIN."
                    : "This copy of Study Buddy is using this browser only. Add DATABASE_URL and SESSION_SECRET to share across devices."}
                </p>
                {mode === "db" ? (
                  <Button
                    variant="outline"
                    className="h-12 px-5 text-base"
                    onClick={() => {
                      void signOutDevice().then(() => {
                        toast.success("This device was signed out")
                      })
                    }}
                  >
                    Sign out this device
                  </Button>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reset this device</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {mode === "db"
                    ? "Clears the shared PIN, children, personal cards, and edits for every device. Seeded decks come back."
                    : "Clears the PIN, children, personal cards, and any edits. Year 1 and Year 2 Maths and Reading decks are restored."}
                </p>
                <ConfirmDelete
                  triggerLabel="Reset everything"
                  title={mode === "db" ? "Reset the shared database?" : "Reset this device?"}
                  description={
                    mode === "db"
                      ? "All Study Buddy data in Neon will be replaced with the original seeded decks. Every device will need the family PIN again."
                      : "All local Study Buddy data on this browser will be replaced with the original seeded decks."
                  }
                  confirmLabel="Reset"
                  onConfirm={() => {
                    void resetDevice().then(() => {
                      toast.success(
                        mode === "db"
                          ? "The shared database was reset"
                          : "This device was reset",
                      )
                    })
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AppShell>

      <KidFormDialog
        open={kidDialog !== null}
        onOpenChange={(open) => {
          if (!open) setKidDialog(null)
        }}
        kid={kidDialog && kidDialog !== "new" ? kidDialog : undefined}
        onSubmit={(input) => {
          if (kidDialog && kidDialog !== "new") {
            updateKid(kidDialog.id, input)
            toast.success(`${input.name} was updated`)
          } else {
            addKid(input)
            toast.success(`${input.name} can now pick a profile`)
          }
        }}
      />

      <Dialog
        open={subjectDialog !== null}
        onOpenChange={(open) => {
          if (!open) setSubjectDialog(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {subjectDialog && subjectDialog !== "new"
                ? "Rename subject"
                : "Add a subject"}
            </DialogTitle>
            <DialogDescription>
              Each subject gets a deck for Years 1, 2, 3 and 4. You fill the
              shared cards; children can add their own on top.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="subject-name">Subject name</Label>
            <Input
              id="subject-name"
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
              className="h-12 text-base"
              placeholder="Science"
              maxLength={32}
            />
            {subjectError ? (
              <p className="text-sm text-destructive" role="alert">
                {subjectError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setSubjectDialog(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-11"
              onClick={() => {
                const name = subjectName.trim()
                if (!name) {
                  setSubjectError("Enter a subject name.")
                  return
                }
                if (subjectDialog && subjectDialog !== "new") {
                  updateSubject(subjectDialog.id, name)
                  toast.success("Subject renamed")
                } else {
                  addSubject(name)
                  toast.success(`${name} is ready for Years 1–4`)
                }
                setSubjectDialog(null)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ParentGate>
  )
}
