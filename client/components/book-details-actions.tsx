"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import {
  useActivityState,
  type RequestAccessResult,
} from "@/components/providers/activity-provider"
import { Button } from "@/components/ui/button"
import type { Book } from "@/types/book"

interface BookDetailsActionsProps {
  book: Book
}

export function BookDetailsActions({ book }: BookDetailsActionsProps) {
  const { addRecentlyViewedBook, requestAccess } = useActivityState()
  const [requestStatus, setRequestStatus] = useState<"idle" | RequestAccessResult>("idle")

  useEffect(() => {
    addRecentlyViewedBook(book)
  }, [book, addRecentlyViewedBook])

  const isRequestActionDisabled = requestStatus !== "idle"

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={isRequestActionDisabled}
          onClick={() => {
            const result = requestAccess(book)
            setRequestStatus(result)
          }}
        >
          Request Access
        </Button>
        <Button variant="outline" disabled>
          View Snippet
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
    </>
  )
}
