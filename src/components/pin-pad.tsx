"use client"

import { Delete } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const

export function PinPad({
  value,
  onChange,
  disabled,
  ariaLabel,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  ariaLabel: string
}) {
  function press(digit: string) {
    if (disabled || value.length >= 4) return
    onChange(value + digit)
  }

  function backspace() {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  return (
    <div className="mx-auto w-full max-w-xs">
      <div
        className="mb-5 flex justify-center gap-3"
        role="img"
        aria-label={`${ariaLabel}: ${value.length} of 4 digits entered`}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "size-4 rounded-full border-2",
              index < value.length
                ? "border-primary bg-primary"
                : "border-muted-foreground/40 bg-transparent",
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key) => (
          <Button
            key={key}
            type="button"
            variant="secondary"
            disabled={disabled}
            className="h-16 text-2xl font-semibold"
            onClick={() => press(key)}
          >
            {key}
          </Button>
        ))}
        <span />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          className="h-16 text-2xl font-semibold"
          onClick={() => press("0")}
        >
          0
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled || value.length === 0}
          className="h-16"
          onClick={backspace}
          aria-label="Delete last digit"
        >
          <Delete className="size-6" />
        </Button>
      </div>
    </div>
  )
}
