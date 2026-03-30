"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { useActivityState } from "@/components/providers/activity-provider"
import { Button } from "@/components/ui/button"
import type { Book } from "@/types/book"

interface BookDetailsActionsProps {
  book: Book
}

export function BookDetailsActions({ book }: BookDetailsActionsProps) {
  const { addRecentlyViewedBook, requestAccess } = useActivityState()
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  useEffect(() => {
    addRecentlyViewedBook(book)
  }, [book, addRecentlyViewedBook])

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            requestAccess(book)
            setRequestSubmitted(true)
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
      {requestSubmitted ? (
        <p className="text-xs text-muted-foreground">
          Request added to Active Requests (mock state).
        </p>
      ) : null}
    </>
  )
}
