"use client"

import { Toaster } from "@/components/ui/sonner"
import { FamilyGate } from "@/components/family-gate"
import { StoreProvider } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <FamilyGate>
        {children}
        <Toaster theme="light" position="top-center" />
      </FamilyGate>
    </StoreProvider>
  )
}
