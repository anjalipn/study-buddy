"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { AvatarBadge } from "@/components/avatar-badge"
import { EmptyState } from "@/components/empty-state"
import { StoreReady } from "@/components/store-ready"
import { Button } from "@/components/ui/button"
import { getAvatar } from "@/lib/avatars"
import { yearLabel } from "@/lib/selectors"
import { useStore } from "@/lib/store"

export function HomePage() {
  const router = useRouter()
  const { data, loginKid } = useStore()

  return (
    <StoreReady>
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-10 sm:px-6">
        <p className="text-sm font-medium text-primary">Study Buddy</p>
        <h1 className="mt-1 font-heading text-4xl font-semibold tracking-tight">
          Who’s studying?
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
          Pick your name to open Year 1–4 flashcards. Parents use a PIN to add
          children and edit the shared decks.
        </p>

        {data.kids.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="No children yet"
            description="A parent needs to add a name, school year, and avatar before anyone can study."
            action={
              <Button asChild className="h-12 px-5 text-base">
                <Link href="/parent">Open parent settings</Link>
              </Button>
            }
          />
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.kids.map((kid) => {
              const avatar = getAvatar(kid.avatar)
              return (
                <li key={kid.id}>
                  <button
                    type="button"
                    onClick={() => {
                      loginKid(kid.id)
                      router.push(`/kid/${kid.id}`)
                    }}
                    className="flex h-full w-full flex-col items-center gap-3 rounded-3xl bg-card px-3 py-6 text-center shadow-sm ring-1 ring-foreground/10 transition hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <AvatarBadge avatar={kid.avatar} size="lg" />
                    <span className="font-heading text-xl font-semibold">
                      {kid.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {yearLabel(kid.year)} · {avatar.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-auto pt-12">
          <Button
            asChild
            variant="outline"
            className="h-12 w-full px-5 text-base sm:w-auto"
          >
            <Link href="/parent">I’m a parent</Link>
          </Button>
        </div>
      </div>
    </StoreReady>
  )
}
