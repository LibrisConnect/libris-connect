"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useActivityState } from "@/components/providers/activity-provider"
import type { Book } from "@/types/book"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { availabilityBadgeStyles, availabilityLabel } from "@/lib/book-presentation"

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const { addRecentlyViewedBook } = useActivityState()

  return (
    <Link
      href={`/book/${book.id}`}
      className="group block h-full"
      onClick={() => {
        addRecentlyViewedBook(book)
      }}
    >
      <Card className="h-full border bg-card py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="space-y-3 p-4">
          <CardTitle className="line-clamp-2 text-base">{book.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{book.author}</p>

          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ${availabilityBadgeStyles[book.availability]}`}
            >
              {availabilityLabel[book.availability]}
            </span>
            <span className="truncate text-xs text-muted-foreground">{book.college}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            View details
            <ArrowRight className="size-3.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
