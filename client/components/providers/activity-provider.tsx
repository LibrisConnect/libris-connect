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

import { apiClient } from "@/lib/api-client"
import type { Book } from "@/types/book"
import type { LibraryRequest } from "@/types/request"
import { useSessionState } from "@/components/providers/session-provider"

export type RequestAccessResult = "created" | "duplicate"

interface ActivityContextValue {
  recentlyViewedBooks: Book[]
  activeRequests: LibraryRequest[]
  addRecentlyViewedBook: (book: Book) => void
  requestAccess: (book: Book) => Promise<RequestAccessResult>
}

const normalizeRequest = (rawRequest: any): LibraryRequest => {
  const book = rawRequest.book
  const collegeName =
    book?.college?.name || rawRequest.targetCollege || rawRequest.college?.name || "Unknown College"

  return {
    id: String(rawRequest._id || rawRequest.id),
    bookId: String(book?._id || rawRequest.bookId || ""),
    title: String(book?.title || rawRequest.title || "Untitled Book"),
    targetCollege: String(collegeName),
    state: rawRequest.status || rawRequest.state || "pending_approval",
    createdAt: String(rawRequest.createdAt || new Date().toISOString()),
  }
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined)

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { session, isSessionHydrated } = useSessionState()
  const [recentlyViewedBooks, setRecentlyViewedBooks] = useState<Book[]>([])
  const [activeRequests, setActiveRequests] = useState<LibraryRequest[]>([])

  useEffect(() => {
    const loadRequests = async () => {
      if (!isSessionHydrated) {
        return
      }

      if (!session.isAuthenticated || session.user?.role !== "student") {
        setActiveRequests([])
        return
      }

      try {
        const response = await apiClient.getMyBookRequests()
        const requests = Array.isArray(response.requests) ? response.requests.map(normalizeRequest) : []
        setActiveRequests(requests)
      } catch (error) {
        console.error("Failed to load book requests:", error)
        setActiveRequests([])
      }
    }

    loadRequests()
  }, [isSessionHydrated, session.isAuthenticated, session.user?.role])

  const addRecentlyViewedBook = useCallback((book: Book) => {
    setRecentlyViewedBooks((prev) => [book, ...prev.filter((item) => item.id !== book.id)].slice(0, 6))
  }, [])

  const requestAccess = useCallback(
    async (book: Book): Promise<RequestAccessResult> => {
      const hasPendingRequest = activeRequests.some(
        (request) => request.bookId === book.id && request.state === "pending_approval"
      )

      if (hasPendingRequest) {
        return "duplicate"
      }

      try {
        const response = await apiClient.createBookRequest(book.id)
        const createdRequest = normalizeRequest(response.request)
        setActiveRequests((prev) => [createdRequest, ...prev])
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : ""
        if (message.includes("already exists") || message.includes("pending request")) {
          return "duplicate"
        }
        throw error
      }

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
