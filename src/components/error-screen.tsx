"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export function ErrorScreen({
  title,
  description,
  onRetry,
  onReset,
}: {
  title: string
  description: string
  onRetry?: () => void
  onReset?: () => void
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-6 py-10">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="text-base leading-7 text-muted-foreground">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry ? (
          <Button className="h-12 px-5 text-base" onClick={onRetry}>
            Try again
          </Button>
        ) : (
          <Button asChild className="h-12 px-5 text-base">
            <Link href="/">Back to profiles</Link>
          </Button>
        )}
        {onReset ? (
          <Button
            variant="outline"
            className="h-12 px-5 text-base"
            onClick={onReset}
          >
            Reset this device
          </Button>
        ) : null}
      </div>
    </div>
  )
}

