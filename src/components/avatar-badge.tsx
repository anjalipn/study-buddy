"use client"

import { cn } from "@/lib/utils"
import { getAvatar } from "@/lib/avatars"
import type { AvatarId } from "@/lib/types"

function FoxMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M10 12 18 20 24 16 30 20 38 12 34 28c0 7-4.5 12-10 12s-10-5-10-12L10 12Zm8.5 18.5c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7-1.8-.7-1.8-1.7.8-1.8 1.8-1.8Zm11 0c1 0 1.8.8 1.8 1.8s-.8 1.7-1.8 1.7-1.8-.7-1.8-1.7.8-1.8 1.8-1.8Z"
      />
    </svg>
  )
}

function OwlMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M24 8c8 0 14 7 14 16 0 9-6 16-14 16S10 33 10 24 16 8 24 8Zm-6 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm12 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6 11c2.4 0 4.2 1.2 4.2 2.4S26.4 36 24 36s-4.2-1.2-4.2-2.6S21.6 31 24 31Z"
      />
    </svg>
  )
}

function OtterMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M12 22c0-7 5.5-12 12-12s12 5 12 12c3 1 5 4 5 7 0 5-6 9-17 9S7 34 7 29c0-3 2-6 5-7Zm7-2.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm10 0a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM24 29c2 0 3.5 1 3.5 2s-1.5 2-3.5 2-3.5-1-3.5-2 1.5-2 3.5-2Z"
      />
    </svg>
  )
}

function RobinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M24 10c7 0 13 6.5 13 14 0 8-6 14-13 14S11 32 11 24 17 10 24 10Zm0 8c-4 0-7 2.8-7 6.5S20 31 24 31s7-2.8 7-6.5S28 18 24 18Zm14 4 5 3-5 2v-5Z"
      />
    </svg>
  )
}

function BadgerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M8 20c0-6 7-10 16-10s16 4 16 10v10c0 6-7 10-16 10S8 36 8 30V20Zm8 2h4v10h-4V22Zm12 0h4v10h-4V22Z"
      />
    </svg>
  )
}

function HareMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M16 8c2 0 4 8 4 14h-2C14 22 12 14 12 10c0-1.2 1.8-2 4-2Zm16 0c2.2 0 4 .8 4 2 0 4-2 12-6 12h-2c0-6 2-14 4-14ZM24 16c8 0 14 5 14 12s-6 12-14 12S10 35 10 28s6-12 14-12Zm-5 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
      />
    </svg>
  )
}

const MARKS: Record<
  AvatarId,
  (props: { className?: string }) => ReturnType<typeof FoxMark>
> = {
  fox: FoxMark,
  owl: OwlMark,
  otter: OtterMark,
  robin: RobinMark,
  badger: BadgerMark,
  hare: HareMark,
}

export function AvatarBadge({
  avatar,
  size = "md",
  className,
}: {
  avatar: AvatarId
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const meta = getAvatar(avatar)
  const Mark = MARKS[avatar]
  const sizes = {
    sm: "size-10",
    md: "size-14",
    lg: "size-20",
    xl: "size-24",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shadow-sm ring-2 ring-white/70",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: meta.background, color: meta.ink }}
      aria-hidden
    >
      <Mark className="size-[70%]" />
    </span>
  )
}
