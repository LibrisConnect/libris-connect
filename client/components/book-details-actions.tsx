"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import {
  useActivityState,
  type RequestAccessResult,
} from "@/components/providers/activity-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSessionState } from "@/components/providers/session-provider"
import type { Book } from "@/types/book"

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

interface BookDetailsActionsProps {
  book: Book
}

export function BookDetailsActions({ book }: BookDetailsActionsProps) {
  const router = useRouter()
  const { addRecentlyViewedBook, requestAccess } = useActivityState()
  const { session } = useSessionState()
  const [requestStatus, setRequestStatus] = useState<"idle" | RequestAccessResult>("idle")
  const [borrowHistory, setBorrowHistory] = useState(book.borrowHistory ?? [])
  const [conditionReviews, setConditionReviews] = useState(book.conditionReviews ?? [])
  const [borrowDays, setBorrowDays] = useState(book.borrowPolicy?.maxBorrowDays ?? 14)
  const [isBorrowed, setIsBorrowed] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewCondition, setReviewCondition] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [reviewText, setReviewText] = useState("")
  const [authNotice, setAuthNotice] = useState<string | null>(null)

  useEffect(() => {
    addRecentlyViewedBook(book)
  }, [book, addRecentlyViewedBook])

  const isRequestActionDisabled = requestStatus !== "idle"
  const requiresLogin = !session.isAuthenticated

  const handleAuthRequired = () => {
    setAuthNotice("Please log in to borrow or request this book.")
    router.push(`/login?redirect=/book/${book.id}`)
  }

  const handleBorrow = () => {
    if (requiresLogin) {
      handleAuthRequired()
      return
    }

    const now = new Date()
    const dueDate = new Date(now)
    dueDate.setDate(now.getDate() + borrowDays)

    setBorrowHistory((prev) => [
      {
        borrowerName: session.user?.name ?? "Current Student",
        borrowerEmail: session.user?.email,
        borrowedAt: now.toISOString(),
        dueAt: dueDate.toISOString(),
        status: "borrowed",
        notes: `Borrowed for ${borrowDays} days through details page`,
      },
      ...prev,
    ])
    setIsBorrowed(true)
  }

  const handleReturnAndReview = () => {
    if (requiresLogin) {
      handleAuthRequired()
      return
    }

    const returnedAt = new Date().toISOString()

    setBorrowHistory((prev) => {
      const next = [...prev]
      const activeIndex = next.findIndex(
        (entry) =>
          entry.status === "borrowed" &&
          entry.borrowerName === (session.user?.name ?? "Current Student")
      )

      if (activeIndex >= 0) {
        next[activeIndex] = {
          ...next[activeIndex],
          status: "returned",
          returnedAt,
          conditionOnReturn: reviewCondition,
        }
      }

      return next
    })

    setConditionReviews((prev) => [
      {
        reviewerName: session.user?.name ?? "Current Student",
        rating: reviewRating,
        condition: reviewCondition,
        review: reviewText.trim() || "Returned without additional notes.",
        createdAt: returnedAt,
      },
      ...prev,
    ])

    setIsBorrowed(false)
    setReviewText("")
    setReviewRating(5)
    setReviewCondition("good")
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dashed bg-muted/30 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Borrowing actions</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Request borrowing, borrow for a selected number of days, and rate condition after return.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isRequestActionDisabled}
          onClick={() => {
            if (requiresLogin) {
              handleAuthRequired()
              return
            }
            const result = requestAccess(book)
            setRequestStatus(result)
          }}
        >
          Request Borrowing
        </Button>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={book.borrowPolicy?.maxBorrowDays ?? 30}
            value={borrowDays}
            onChange={(event) => setBorrowDays(Number(event.target.value || 1))}
            className="w-24"
          />
          <Button variant="outline" onClick={handleBorrow} disabled={isBorrowed}>
            Borrow
          </Button>
        </div>
        <Button variant="outline" disabled>
          View Sample
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
      {requestStatus === "created" ? (
        <p className="text-xs text-muted-foreground">
          Request added to Active Requests (mock state).
        </p>
      ) : null}
      {requestStatus === "duplicate" ? (
        <p className="text-xs text-muted-foreground">
          A pending request already exists for this book.
        </p>
      ) : null}
      {authNotice ? <p className="text-xs text-destructive">{authNotice}</p> : null}

      {requiresLogin ? (
        <p className="text-xs text-muted-foreground">
          Borrowing and reviews require sign-in. You will be redirected to login and returned to this book.
        </p>
      ) : null}

      {isBorrowed && !requiresLogin ? (
        <div className="space-y-3 rounded-lg border bg-background p-4">
          <p className="text-sm font-medium text-foreground">Return and rate book condition</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Rating (1-5)</label>
              <Input
                type="number"
                min={1}
                max={5}
                value={reviewRating}
                onChange={(event) => setReviewRating(Number(event.target.value || 1))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Condition</label>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={reviewCondition}
                onChange={(event) =>
                  setReviewCondition(event.target.value as "excellent" | "good" | "fair" | "poor")
                }
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleReturnAndReview}>
                Return and Submit Review
              </Button>
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            rows={3}
            placeholder="Share notes about condition, highlighting, damaged pages, etc."
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2 rounded-lg border bg-background p-4">
          <p className="text-sm font-medium text-foreground">Borrow history</p>
          {borrowHistory.length > 0 ? (
            <div className="space-y-2">
              {borrowHistory.slice(0, 5).map((entry, index) => (
                <div key={`${entry.borrowerName}-${entry.borrowedAt}-${index}`} className="rounded-md border p-2 text-xs">
                  <p className="font-medium">
                    {entry.borrowerName} • {entry.status}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {formatDate(entry.borrowedAt)} to {formatDate(entry.dueAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No borrowing history yet.</p>
          )}
        </div>

        <div className="space-y-2 rounded-lg border bg-background p-4">
          <p className="text-sm font-medium text-foreground">Condition reviews</p>
          {conditionReviews.length > 0 ? (
            <div className="space-y-2">
              {conditionReviews.slice(0, 5).map((review, index) => (
                <div key={`${review.reviewerName}-${review.createdAt}-${index}`} className="rounded-md border p-2 text-xs">
                  <p className="font-medium">
                    {review.reviewerName} • {review.rating}/5 • {review.condition}
                  </p>
                  <p className="mt-1 text-muted-foreground">{review.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No condition reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
