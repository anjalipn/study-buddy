"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { ErrorScreen } from "@/components/error-screen"
import { LoadingScreen } from "@/components/loading-screen"
import { PinPad } from "@/components/pin-pad"
import { Button } from "@/components/ui/button"
import { isPin } from "@/lib/selectors"
import { useStore } from "@/lib/store"

export function ParentGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const {
    status,
    error,
    data,
    session,
    mode,
    authenticated,
    setPin,
    verifyPin,
    loginAdmin,
    resetDevice,
  } = useStore()
  const [digits, setDigits] = useState("")
  const [pendingPin, setPendingPin] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const unlocked = session?.role === "admin"
  const step: "create" | "confirm" | "enter" = confirming
    ? "confirm"
    : data.pin
      ? "enter"
      : "create"

  useEffect(() => {
    if (mode === "db" && authenticated) loginAdmin()
  }, [authenticated, loginAdmin, mode])

  async function handleDigits(next: string) {
    setDigits(next)
    setPinError(null)
    if (!isPin(next)) return

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
      try {
        await setPin(next)
        loginAdmin()
        setDigits("")
        setPendingPin("")
        setConfirming(false)
      } catch (cause) {
        setPinError(
          cause instanceof Error ? cause.message : "Could not save that PIN.",
        )
        setDigits("")
      }
      return
    }

    if (await verifyPin(next)) {
      loginAdmin()
      setDigits("")
      return
    }

    setPinError("That PIN is not right. Try again.")
    setDigits("")
  }

  if (status === "loading") {
    return <LoadingScreen message="Opening Study Buddy…" />
  }

  if (status === "error") {
    return (
      <ErrorScreen
        title="Could not open saved data"
        description={error ?? "Something went wrong while reading this device."}
        onRetry={() => window.location.reload()}
        onReset={() => void resetDevice()}
      />
    )
  }

  if (mode === "db") {
    if (!unlocked) {
      return <LoadingScreen message="Opening parent settings…" />
    }
    return <>{children}</>
  }

  if (unlocked) {
    return <>{children}</>
  }

  const heading =
    step === "create"
      ? "Set a parent PIN"
      : step === "confirm"
        ? "Type that PIN again"
        : "Enter your parent PIN"

  const copy =
    step === "create"
      ? "Choose four digits. Children pick a named profile and never need this PIN."
      : step === "confirm"
        ? "Enter the same four digits to save them on this device."
        : "Only a parent should open this side of Study Buddy."

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="text-sm font-medium text-primary">Parent</p>
      <h1 className="mt-1 font-heading text-3xl font-semibold">{heading}</h1>
      <p className="mt-3 mb-8 text-base leading-7 text-muted-foreground">
        {copy}
      </p>
      <PinPad value={digits} onChange={(value) => void handleDigits(value)} ariaLabel={heading} />
      {pinError ? (
        <p className="mt-5 text-center text-sm text-destructive" role="alert">
          {pinError}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-2">
        <Button
          variant="ghost"
          className="h-11"
          onClick={() => router.push("/")}
        >
          Back to profiles
        </Button>
        {data.pin ? (
          <Button
            variant="ghost"
            className="h-11 text-muted-foreground"
            onClick={() => {
              if (
                window.confirm(
                  "This clears the PIN, children, and any extra cards on this device. Seeded Year 1 and Year 2 decks come back.",
                )
              ) {
                void resetDevice()
                setConfirming(false)
                setDigits("")
                setPendingPin("")
              }
            }}
          >
            Forgot PIN? Reset this device
          </Button>
        ) : null}
      </div>
    </div>
  )
}
