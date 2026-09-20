"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { api } from "@/lib/client-api"
import { createId } from "@/lib/ids"
import { createSeedData } from "@/lib/seed"
import {
  clearData,
  loadData,
  loadSession,
  saveData,
  saveSession,
  STORAGE_ERROR,
} from "@/lib/storage"
import type {
  AppData,
  AvatarId,
  Flashcard,
  Kid,
  SchoolYear,
  Session,
  Subject,
  WordDetails,
} from "@/lib/types"
import { formatWordBack } from "@/lib/year4-vocabulary"

type StoreStatus = "loading" | "ready" | "error"
export type StoreMode = "local" | "db"

type KidInput = {
  name: string
  year: SchoolYear
  avatar: AvatarId
}

type CardInput = {
  front: string
  back: string
  word?: WordDetails
}

type WordCardInput = {
  deckId: string
  kidId: string | null
  term: string
  details: WordDetails
}

type StoreValue = {
  status: StoreStatus
  error: string | null
  mode: StoreMode
  authenticated: boolean
  hasPin: boolean
  data: AppData
  session: Session
  setPin: (pin: string) => Promise<void>
  verifyPin: (pin: string) => Promise<boolean>
  createFamilyPin: (pin: string) => Promise<void>
  unlockFamily: (pin: string) => Promise<void>
  signOutDevice: () => Promise<void>
  loginAdmin: () => void
  loginKid: (kidId: string) => void
  logout: () => void
  resetDevice: () => Promise<void>
  addKid: (input: KidInput) => Kid
  updateKid: (id: string, input: KidInput) => void
  deleteKid: (id: string) => void
  addSubject: (name: string) => Subject
  updateSubject: (id: string, name: string) => void
  deleteSubject: (id: string) => void
  updateDeckTitle: (id: string, title: string) => void
  addCard: (input: CardInput & { deckId: string; kidId: string | null }) => Flashcard
  addWordCards: (inputs: WordCardInput[]) => { added: number; skipped: number }
  updateCard: (id: string, input: CardInput) => void
  deleteCard: (id: string) => void
  markCard: (kidId: string, cardId: string, status: "know" | "learning") => void
  clearDeckProgress: (kidId: string, deckId: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<StoreMode>("local")
  const [authenticated, setAuthenticated] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [data, setData] = useState<AppData>(createSeedData)
  const [session, setSessionState] = useState<Session>(null)
  const modeRef = useRef<StoreMode>("local")
  const queueRef = useRef<AppData | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const persistRemote = useCallback(async (next: AppData) => {
    queueRef.current = next
    if (savingRef.current) return
    savingRef.current = true
    try {
      while (queueRef.current) {
        const snapshot = queueRef.current
        queueRef.current = null
        await api("/api/data", {
          method: "PUT",
          body: JSON.stringify(snapshot),
        })
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save to the shared database.",
      )
    } finally {
      savingRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      try {
        const health = await api<{ database: boolean }>("/api/health")
        if (cancelled) return
        if (!health.database) {
          const local = loadData()
          setMode("local")
          setAuthenticated(true)
          setHasPin(Boolean(local.pin))
          setData(local)
          setSessionState(loadSession())
          setStatus("ready")
          setError(null)
          return
        }
        setMode("db")
        const auth = await api<{ hasPin: boolean; authenticated: boolean }>(
          "/api/auth/status",
        )
        if (cancelled) return
        setHasPin(auth.hasPin)
        setAuthenticated(auth.authenticated)
        if (auth.authenticated) {
          setData(await api<AppData>("/api/data"))
          setSessionState(loadSession())
        } else {
          setData(createSeedData())
          setSessionState(null)
        }
        setStatus("ready")
        setError(null)
      } catch (cause) {
        if (cancelled) return
        try {
          setMode("local")
          setAuthenticated(true)
          setData(loadData())
          setSessionState(loadSession())
          setHasPin(Boolean(loadData().pin))
          setStatus("ready")
          setError(null)
        } catch {
          setStatus("error")
          setError(cause instanceof Error ? cause.message : STORAGE_ERROR)
        }
      }
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback(
    (updater: (current: AppData) => AppData) => {
      setData((current) => {
        const next = updater(current)
        if (modeRef.current === "local") {
          saveData(next)
        } else {
          void persistRemote(next)
        }
        return next
      })
    },
    [persistRemote],
  )

  const setSession = useCallback((next: Session) => {
    saveSession(next)
    setSessionState(next)
  }, [])

  const loginAdmin = useCallback(() => {
    setSessionState((current) => {
      if (current?.role === "admin") return current
      const next = { role: "admin" as const }
      saveSession(next)
      return next
    })
  }, [])

  const loginKid = useCallback((kidId: string) => {
    setSessionState((current) => {
      if (current?.role === "kid" && current.kidId === kidId) return current
      const next = { role: "kid" as const, kidId }
      saveSession(next)
      return next
    })
  }, [])

  const logout = useCallback(() => {
    setSessionState((current) => {
      if (!current) return current
      saveSession(null)
      return null
    })
  }, [])

  const createFamilyPin = useCallback(async (pin: string) => {
    await api("/api/auth/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    })
    setHasPin(true)
    setAuthenticated(true)
    setData(await api<AppData>("/api/data"))
  }, [])

  const unlockFamily = useCallback(async (pin: string) => {
    await api("/api/auth/unlock", {
      method: "POST",
      body: JSON.stringify({ pin }),
    })
    setAuthenticated(true)
    setHasPin(true)
    setData(await api<AppData>("/api/data"))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      status,
      error,
      mode,
      authenticated,
      hasPin,
      data,
      session,
      setPin: async (pin) => {
        if (mode === "db") {
          await createFamilyPin(pin)
          return
        }
        update((current) => ({ ...current, pin }))
      },
      verifyPin: async (pin) => {
        if (mode === "db") {
          try {
            await unlockFamily(pin)
            return true
          } catch {
            return false
          }
        }
        return data.pin === pin
      },
      createFamilyPin,
      unlockFamily,
      signOutDevice: async () => {
        if (mode === "db") {
          await api("/api/auth/logout", { method: "POST" })
          setAuthenticated(false)
          setData(createSeedData())
        }
        saveSession(null)
        setSessionState(null)
      },
      loginAdmin,
      loginKid,
      logout,
      resetDevice: async () => {
        if (mode === "db") {
          await api("/api/reset", { method: "POST" })
          setAuthenticated(false)
          setHasPin(false)
          setData(createSeedData())
          setSessionState(null)
          setStatus("ready")
          setError(null)
          return
        }
        clearData()
        const seeded = createSeedData()
        saveData(seeded)
        setData(seeded)
        setSessionState(null)
        setHasPin(false)
        setStatus("ready")
        setError(null)
      },
      addKid: (input) => {
        const kid: Kid = { id: createId("kid"), ...input }
        update((current) => ({ ...current, kids: [...current.kids, kid] }))
        return kid
      },
      updateKid: (id, input) => {
        update((current) => ({
          ...current,
          kids: current.kids.map((kid) =>
            kid.id === id ? { ...kid, ...input } : kid,
          ),
        }))
      },
      deleteKid: (id) => {
        update((current) => ({
          ...current,
          kids: current.kids.filter((kid) => kid.id !== id),
          cards: current.cards.filter((card) => card.kidId !== id),
          progress: current.progress.filter((entry) => entry.kidId !== id),
        }))
        if (session?.role === "kid" && session.kidId === id) {
          setSession(null)
        }
      },
      addSubject: (name) => {
        const subject: Subject = { id: createId("subject"), name }
        const decks = ([1, 2, 3, 4] as const).map((year) => ({
          id: createId("deck"),
          subjectId: subject.id,
          year,
          title: `Year ${year} ${name}`,
        }))
        update((current) => ({
          ...current,
          subjects: [...current.subjects, subject],
          decks: [...current.decks, ...decks],
        }))
        return subject
      },
      updateSubject: (id, name) => {
        update((current) => ({
          ...current,
          subjects: current.subjects.map((subject) =>
            subject.id === id ? { ...subject, name } : subject,
          ),
        }))
      },
      deleteSubject: (id) => {
        update((current) => {
          const deckIds = new Set(
            current.decks
              .filter((deck) => deck.subjectId === id)
              .map((deck) => deck.id),
          )
          return {
            ...current,
            subjects: current.subjects.filter((subject) => subject.id !== id),
            decks: current.decks.filter((deck) => deck.subjectId !== id),
            cards: current.cards.filter((card) => !deckIds.has(card.deckId)),
            progress: current.progress.filter((entry) => {
              const card = current.cards.find((item) => item.id === entry.cardId)
              return card ? !deckIds.has(card.deckId) : false
            }),
          }
        })
      },
      updateDeckTitle: (id, title) => {
        update((current) => ({
          ...current,
          decks: current.decks.map((deck) =>
            deck.id === id ? { ...deck, title } : deck,
          ),
        }))
      },
      addCard: ({ deckId, kidId, front, back, word }) => {
        const now = new Date().toISOString()
        const card: Flashcard = {
          id: createId("card"),
          deckId,
          kidId,
          front,
          back,
          word,
          addedAt: now,
        }
        update((current) => ({ ...current, cards: [...current.cards, card] }))
        return card
      },
      addWordCards: (inputs) => {
        const seen = new Set(
          data.cards.map(
            (card) =>
              `${card.deckId}:${card.kidId ?? "year"}:${card.front.toLowerCase()}`,
          ),
        )
        const next: Flashcard[] = []
        let skipped = 0
        for (const input of inputs) {
          const key = `${input.deckId}:${input.kidId ?? "year"}:${input.term.toLowerCase()}`
          if (seen.has(key)) {
            skipped += 1
            continue
          }
          seen.add(key)
          next.push({
            id: createId("card"),
            deckId: input.deckId,
            kidId: input.kidId,
            front: input.term,
            back: formatWordBack(input.details),
            word: input.details,
            addedAt: new Date().toISOString(),
          })
        }
        if (next.length > 0) {
          update((current) => ({
            ...current,
            cards: [...current.cards, ...next],
          }))
        }
        return { added: next.length, skipped }
      },
      updateCard: (id, input) => {
        update((current) => ({
          ...current,
          cards: current.cards.map((card) =>
            card.id === id ? { ...card, ...input } : card,
          ),
        }))
      },
      deleteCard: (id) => {
        update((current) => ({
          ...current,
          cards: current.cards.filter((card) => card.id !== id),
          progress: current.progress.filter((entry) => entry.cardId !== id),
        }))
      },
      markCard: (kidId, cardId, status) => {
        update((current) => {
          const without = current.progress.filter(
            (entry) => !(entry.kidId === kidId && entry.cardId === cardId),
          )
          return {
            ...current,
            progress: [...without, { kidId, cardId, status }],
          }
        })
      },
      clearDeckProgress: (kidId, deckId) => {
        update((current) => {
          const cardIds = new Set(
            current.cards
              .filter(
                (card) =>
                  card.deckId === deckId &&
                  (card.kidId === null || card.kidId === kidId),
              )
              .map((card) => card.id),
          )
          return {
            ...current,
            progress: current.progress.filter(
              (entry) =>
                !(entry.kidId === kidId && cardIds.has(entry.cardId)),
            ),
          }
        })
      },
    }),
    [
      authenticated,
      createFamilyPin,
      data,
      error,
      hasPin,
      loginAdmin,
      loginKid,
      logout,
      mode,
      session,
      setSession,
      status,
      unlockFamily,
      update,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) {
    throw new Error("useStore must be used inside StoreProvider")
  }
  return value
}
