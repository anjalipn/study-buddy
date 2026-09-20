"use client"

import { useState } from "react"

import { AvatarBadge } from "@/components/avatar-badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AVATARS } from "@/lib/avatars"
import { SCHOOL_YEARS, type AvatarId, type Kid, type SchoolYear } from "@/lib/types"
import { cn } from "@/lib/utils"

export function KidFormDialog({
  open,
  onOpenChange,
  kid,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  kid?: Kid
  onSubmit: (input: { name: string; year: SchoolYear; avatar: AvatarId }) => void
}) {
  const [name, setName] = useState(kid?.name ?? "")
  const [year, setYear] = useState<SchoolYear>(kid?.year ?? 1)
  const [avatar, setAvatar] = useState<AvatarId>(kid?.avatar ?? "fox")
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(kid?.name ?? "")
      setYear(kid?.year ?? 1)
      setAvatar(kid?.avatar ?? "fox")
      setError(null)
    }
    onOpenChange(next)
  }

  function submit() {
    const nextName = name.trim()
    if (!nextName) {
      setError("Enter a first name.")
      return
    }
    onSubmit({ name: nextName, year, avatar })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kid ? `Edit ${kid.name}` : "Add a child"}</DialogTitle>
          <DialogDescription>
            They will appear on the home screen and can pick this profile with
            no password.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="kid-name">Name</Label>
            <Input
              id="kid-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 text-base"
              autoComplete="off"
              maxLength={24}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kid-year">School year</Label>
            <Select
              value={String(year)}
              onValueChange={(value) => setYear(Number(value) as SchoolYear)}
            >
              <SelectTrigger id="kid-year" className="h-12 w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOOL_YEARS.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    Year {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Avatar</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {AVATARS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAvatar(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-2 text-xs font-medium",
                    avatar === item.id
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-muted",
                  )}
                >
                  <AvatarBadge avatar={item.id} size="sm" />
                  {item.label}
                </button>
              ))}
            </div>
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
            {kid ? "Save changes" : "Add child"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
