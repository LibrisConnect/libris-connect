import { BookDetailsActions } from "@/components/book-details-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCollegeName } from "@/lib/book-normalization"
import { availabilityBadgeStyles, availabilityLabel } from "@/lib/book-presentation"
import { getBookByIdAsync } from "@/services/books"

const formatDate = (value?: string) => {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = await getBookByIdAsync(id)

  if (!book) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border border-dashed py-0">
          <CardContent className="space-y-3 p-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Book unavailable</h1>
            <p className="text-sm text-muted-foreground">
              We couldn’t load this book right now. It may not exist in the current dataset, or the API is temporarily unavailable.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border py-0">
        <CardHeader className="space-y-2 border-b bg-muted/30 py-5">
          <CardTitle className="text-2xl font-semibold tracking-tight">{book.title}</CardTitle>
          <p className="text-sm text-muted-foreground">by {book.author}</p>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">ISBN</p>
              <p className="mt-1 text-sm font-medium">{book.isbn}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Owning College</p>
              <p className="mt-1 text-sm font-medium">{getCollegeName(book.college)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Availability</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ${availabilityBadgeStyles[book.availability]}`}
              >
                {availabilityLabel[book.availability]}
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Max Borrow Period</p>
              <p className="mt-1 text-sm font-medium">
                {book.borrowPolicy?.maxBorrowDays ?? 14} days
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Renewals Allowed</p>
              <p className="mt-1 text-sm font-medium">{book.borrowPolicy?.renewalLimit ?? 1}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily Fine</p>
              <p className="mt-1 text-sm font-medium">INR {book.borrowPolicy?.dailyFineInr ?? 3}</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">About this book</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {book.description ?? "Description is not available for this title yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-1">Category: {book.category ?? "General"}</span>
              <span className="rounded-full bg-muted px-2 py-1">Publisher: {book.publisher ?? "Unknown"}</span>
              <span className="rounded-full bg-muted px-2 py-1">Published: {book.publishedYear ?? "N/A"}</span>
              <span className="rounded-full bg-muted px-2 py-1">Avg rating: {book.rating?.toFixed(1) ?? "N/A"}</span>
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Borrow history (latest)</p>
            {book.borrowHistory && book.borrowHistory.length > 0 ? (
              <div className="mt-3 space-y-2">
                {book.borrowHistory.slice(0, 4).map((entry, index) => (
                  <div key={`${entry.borrowerName}-${entry.borrowedAt}-${index}`} className="rounded-md border bg-background p-3 text-xs">
                    <p className="font-medium text-foreground">
                      {entry.borrowerName} • {entry.status}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Borrowed: {formatDate(entry.borrowedAt)} • Due: {formatDate(entry.dueAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No borrowing activity recorded yet.</p>
            )}
          </div>

          <BookDetailsActions key={book.id} book={book} />
        </CardContent>
      </Card>
    </section>
  )
}
