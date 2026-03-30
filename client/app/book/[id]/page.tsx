import { notFound } from "next/navigation"

import { BookDetailsActions } from "@/components/book-details-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { availabilityBadgeStyles, availabilityLabel } from "@/lib/book-presentation"
import { getBookById } from "@/services/books"

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const book = getBookById(params.id)

  if (!book) {
    notFound()
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border py-0">
        <CardHeader className="space-y-2 border-b bg-muted/30 py-5">
          <CardTitle className="text-2xl font-semibold tracking-tight">{book.title}</CardTitle>
          <p className="text-sm text-muted-foreground">by {book.author}</p>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">ISBN</p>
              <p className="mt-1 text-sm font-medium">{book.isbn}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Owning College</p>
              <p className="mt-1 text-sm font-medium">{book.college}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Availability</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ${availabilityBadgeStyles[book.availability]}`}
              >
                {availabilityLabel[book.availability]}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Availability</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This resource can be requested via inter-library access flow.
            </p>
          </div>

          <BookDetailsActions key={book.id} book={book} />
        </CardContent>
      </Card>
    </section>
  )
}
