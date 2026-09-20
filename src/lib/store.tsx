"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

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
} from "@/lib/types"

type StoreStatus = "loading" | "ready" | "error"

type KidInput = {
  name: string
  year: SchoolYear
  avatar: AvatarId
}

type CardInput = {
  front: string
  back: string
}

type StoreValue = {
  status: StoreStatus
  error: string | null
  data: AppData
  session: Session
  setPin: (pin: string) => void
  verifyPin: (pin: string) => boolean
  loginAdmin: () => void
  loginKid: (kidId: string) => void
  logout: () => void
  resetDevice: () => void
  addKid: (input: KidInput) => Kid
  updateKid: (id: string, input: KidInput) => void
  deleteKid: (id: string) => void
  addSubject: (name: string) => Subject
  updateSubject: (id: string, name: string) => void
  deleteSubject: (id: string) => void
  updateDeckTitle: (id: string, title: string) => void
  addCard: (input: CardInput & { deckId: string; kidId: string | null }) => Flashcard
  updateCard: (id: string, input: CardInput) => void
  deleteCard: (id: string) => void
  markCard: (kidId: string, cardId: string, status: "know" | "learning") => void
  clearDeckProgress: (kidId: string, deckId: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function persist(data: AppData): AppData {
  saveData(data)
  return data
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StoreStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AppData>(createSeedData)
  const [session, setSessionState] = useState<Session>(null)

  useEffect(() => {
    try {
      // Hydrate from this browser's localStorage after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is an external store
      setData(loadData())
      setSessionState(loadSession())
      setStatus("ready")
      setError(null)
    } catch (cause) {
      setStatus("error")
      setError(cause instanceof Error ? cause.message : STORAGE_ERROR)
    }
  }, [])

  const update = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => persist(updater(current)))
  }, [])

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

  const value = useMemo<StoreValue>(
    () => ({
      status,
      error,
      data,
      session,
      setPin: (pin) => {
        update((current) => ({ ...current, pin }))
      },
      verifyPin: (pin) => data.pin === pin,
      loginAdmin,
      loginKid,
      logout,
      resetDevice: () => {
        clearData()
        const seeded = persist(createSeedData())
        setData(seeded)
        setSessionState(null)
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
      addCard: ({ deckId, kidId, front, back }) => {
        const card: Flashcard = {
          id: createId("card"),
          deckId,
          kidId,
          front,
          back,
        }
        update((current) => ({ ...current, cards: [...current.cards, card] }))
        return card
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
    [data, error, loginAdmin, loginKid, logout, session, setSession, status, update],
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
