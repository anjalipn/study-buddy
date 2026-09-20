"use client"

import type { ReactNode } from "react"

import { ErrorScreen } from "@/components/error-screen"
import { LoadingScreen } from "@/components/loading-screen"
import { useStore } from "@/lib/store"

export function StoreReady({ children }: { children: ReactNode }) {
  const { status, error, resetDevice } = useStore()

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

  return <>{children}</>
}
