"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function AppShell({
  title,
  eyebrow,
  backHref,
  backLabel = "Back",
  actions,
  children,
}: {
  title: string
  eyebrow?: string
  backHref?: string
  backLabel?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {backHref ? (
            <Button
              variant="ghost"
              asChild
              className="-ml-2 mb-2 h-10 px-2 text-base"
            >
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>
          ) : null}
          {eyebrow ? (
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {actions}
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
    </div>
  )
}
