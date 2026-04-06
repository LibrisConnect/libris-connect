"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type { Book } from "@/types/book"
import type { LibraryRequest } from "@/types/request"

export type RequestAccessResult = "created" | "duplicate"

interface ActivityContextValue {
  recentlyViewedBooks: Book[]
  activeRequests: LibraryRequest[]
  addRecentlyViewedBook: (book: Book) => void
  requestAccess: (book: Book) => RequestAccessResult
}

const initialActiveRequests: LibraryRequest[] = [
  {
    id: "REQ-1024",
    bookId: "book-8",
    title: "Artificial Intelligence: A Modern Approach",
    targetCollege: "IISc Bengaluru",
    state: "pending_approval",
    createdAt: "2026-03-31T08:30:00.000Z",
  },
  {
    id: "REQ-1021",
    bookId: "book-7",
    title: "Designing Data-Intensive Applications",
    targetCollege: "BITS Pilani",
    state: "ready_for_pickup",
    createdAt: "2026-03-30T12:00:00.000Z",
  },
]

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined)

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [recentlyViewedBooks, setRecentlyViewedBooks] = useState<Book[]>([])
  const [activeRequests, setActiveRequests] =
    useState<LibraryRequest[]>(initialActiveRequests)
  const requestCounter = useRef(1030)

  const addRecentlyViewedBook = useCallback((book: Book) => {
    setRecentlyViewedBooks((prev) => [book, ...prev.filter((item) => item.id !== book.id)].slice(0, 6))
  }, [])

  const requestAccess = useCallback(
    (book: Book): RequestAccessResult => {
      const hasPendingRequest = activeRequests.some(
        (request) => request.bookId === book.id && request.state === "pending_approval"
      )

      if (hasPendingRequest) {
        return "duplicate"
      }

      const nextId = `REQ-${String(requestCounter.current).padStart(4, "0")}`
      requestCounter.current += 1

      setActiveRequests((prev) => [
        {
          id: nextId,
          bookId: book.id,
          title: book.title,
          targetCollege: book.college,
          state: "pending_approval",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])

      return "created"
    },
    [activeRequests]
  )

  const value = useMemo<ActivityContextValue>(
    () => ({
      recentlyViewedBooks,
      activeRequests,
      addRecentlyViewedBook,
      requestAccess,
    }),
    [recentlyViewedBooks, activeRequests, addRecentlyViewedBook, requestAccess]
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivityState() {
  const context = useContext(ActivityContext)
  if (!context) {
    throw new Error("useActivityState must be used within ActivityProvider")
  }
  return context
}
