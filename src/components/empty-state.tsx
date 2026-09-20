import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-5 py-8",
        className,
      )}
    >
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="max-w-prose text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  )
}
