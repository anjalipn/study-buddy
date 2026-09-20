"use client"

import { useState, type ReactNode } from "react"

import { PinPad } from "@/components/pin-pad"
import { isPin } from "@/lib/selectors"
import { useStore } from "@/lib/store"

export function FamilyGate({ children }: { children: ReactNode }) {
  const {
    status,
    mode,
    authenticated,
    hasPin,
    createFamilyPin,
    unlockFamily,
  } = useStore()
  const [digits, setDigits] = useState("")
  const [pendingPin, setPendingPin] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  if (mode === "local" || status !== "ready" || authenticated) {
    return <>{children}</>
  }

  const step: "create" | "confirm" | "enter" = confirming
    ? "confirm"
    : hasPin
      ? "enter"
      : "create"

  async function handleDigits(next: string) {
    setDigits(next)
    setPinError(null)
    if (!isPin(next) || busy) return

    if (step === "create") {
      setPendingPin(next)
      setDigits("")
      setConfirming(true)
      return
    }

    if (step === "confirm") {
      if (next !== pendingPin) {
        setPinError("Those PINs did not match. Start again with four digits.")
        setDigits("")
        setPendingPin("")
        setConfirming(false)
        return
      }
      setBusy(true)
      try {
        await createFamilyPin(next)
        setDigits("")
        setPendingPin("")
        setConfirming(false)
      } catch (cause) {
        setPinError(
          cause instanceof Error ? cause.message : "Could not save that PIN.",
        )
        setDigits("")
      } finally {
        setBusy(false)
      }
      return
    }

    setBusy(true)
    try {
      await unlockFamily(next)
      setDigits("")
    } catch (cause) {
      setPinError(
        cause instanceof Error ? cause.message : "That PIN is not right.",
      )
      setDigits("")
    } finally {
      setBusy(false)
    }
  }

  const heading =
    step === "create"
      ? "Set a family PIN"
      : step === "confirm"
        ? "Type that PIN again"
        : "Enter the family PIN"

  const copy =
    step === "create"
      ? "Choose four digits. Type this once on each device. After that, children just pick their name."
      : step === "confirm"
        ? "Enter the same four digits to save them in the shared database."
        : "This device needs the family PIN before it can see the shared words and children."

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="text-sm font-medium text-primary">Study Buddy</p>
      <h1 className="mt-1 font-heading text-3xl font-semibold">{heading}</h1>
      <p className="mt-3 mb-8 text-base leading-7 text-muted-foreground">
        {copy}
      </p>
      {busy ? (
        <p className="mb-8 text-center text-muted-foreground">Checking PIN…</p>
      ) : (
        <PinPad
          value={digits}
          onChange={(value) => void handleDigits(value)}
          ariaLabel={heading}
        />
      )}
      {pinError ? (
        <p className="mt-5 text-center text-sm text-destructive" role="alert">
          {pinError}
        </p>
      ) : null}
    </div>
  )
}
