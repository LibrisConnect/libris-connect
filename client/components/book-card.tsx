"use client"

import Link from "next/link"
import { ArrowRight, BookMarked, MapPin } from "lucide-react"

import { useActivityState } from "@/components/providers/activity-provider"
import type { Book } from "@/types/book"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { availabilityBadgeStyles, availabilityLabel } from "@/lib/book-presentation"

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const { addRecentlyViewedBook } = useActivityState()

  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case 'available':
        return 'from-green-500/20 to-emerald-500/20 text-green-700 border-green-200'
      case 'limited':
        return 'from-orange-500/20 to-amber-500/20 text-orange-700 border-orange-200'
      default:
        return 'from-red-500/20 to-rose-500/20 text-red-700 border-red-200'
    }
  }

  return (
    <Link
      href={`/book/${book.id}`}
      className="group block h-full"
      onClick={() => {
        addRecentlyViewedBook(book)
      }}
    >
      <Card className="h-full border border-border/60 bg-gradient-to-br from-card to-muted/20 py-0 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1">
        <CardContent className="space-y-4 p-5">
          {/* Header with Rating */}
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base flex-1">{book.title}</CardTitle>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary whitespace-nowrap">
              <span>★</span>
              <span>{book.rating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>

          {/* Author */}
          <p className="text-sm text-muted-foreground font-medium">{book.author}</p>

          {/* ISBN and Category */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-muted/60">{book.category || 'General'}</span>
          </div>

          {/* Availability and College */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/30">
            <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 bg-gradient-to-r ${getAvailabilityColor(book.availability)} ring-current/20`}>
              {availabilityLabel[book.availability]}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{book.college}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-1 text-sm font-semibold text-primary transition-all duration-200 group-hover:gap-2 group-hover:text-accent pt-1">
            View details
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
