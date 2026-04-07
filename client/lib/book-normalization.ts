import type {
  AvailabilityStatus,
  Book,
  BookCondition,
  BorrowHistoryItem,
  BorrowPolicy,
  BorrowStatus,
  ConditionReview,
} from "@/types/book"

type RawCollege = string | { _id?: string; id?: string; name?: string } | null | undefined
type RawAvailability = AvailabilityStatus | { total?: number; available?: number } | null | undefined
type RawBook = Partial<Book> & {
  _id?: string
  name?: string
  college?: RawCollege
  availability?: RawAvailability
}

type RawBorrowPolicy = Partial<BorrowPolicy> | null | undefined
type RawBorrowHistoryItem = Partial<BorrowHistoryItem> | null | undefined
type RawConditionReview = Partial<ConditionReview> | null | undefined

const isAvailabilityStatus = (value: unknown): value is AvailabilityStatus =>
  value === "available" || value === "issued" || value === "digital"

const isBorrowStatus = (value: unknown): value is BorrowStatus =>
  value === "borrowed" || value === "returned" || value === "overdue"

const isBookCondition = (value: unknown): value is BookCondition =>
  value === "excellent" || value === "good" || value === "fair" || value === "poor"

export function getCollegeName(college: RawCollege): string {
  if (typeof college === "string") {
    return college
  }

  return college?.name ?? ""
}

export function normalizeAvailability(availability: RawAvailability): AvailabilityStatus {
  if (isAvailabilityStatus(availability)) {
    return availability
  }

  if (availability && typeof availability === "object") {
    if (typeof availability.available === "number") {
      return availability.available > 0 ? "available" : "issued"
    }

    if (typeof availability.total === "number") {
      return availability.total > 0 ? "available" : "issued"
    }
  }

  return "available"
}

export function normalizeBook(book: RawBook): Book {
  const rawBorrowPolicy = book.borrowPolicy as RawBorrowPolicy
  const rawBorrowHistory = Array.isArray(book.borrowHistory)
    ? (book.borrowHistory as RawBorrowHistoryItem[])
    : []
  const rawConditionReviews = Array.isArray(book.conditionReviews)
    ? (book.conditionReviews as RawConditionReview[])
    : []

  const borrowPolicy: BorrowPolicy = {
    maxBorrowDays:
      typeof rawBorrowPolicy?.maxBorrowDays === "number" ? rawBorrowPolicy.maxBorrowDays : 14,
    renewalLimit:
      typeof rawBorrowPolicy?.renewalLimit === "number" ? rawBorrowPolicy.renewalLimit : 1,
    dailyFineInr:
      typeof rawBorrowPolicy?.dailyFineInr === "number" ? rawBorrowPolicy.dailyFineInr : 3,
  }

  const borrowHistory: BorrowHistoryItem[] = rawBorrowHistory.map((entry, index) => ({
    borrowerName: String(entry?.borrowerName ?? `Reader ${index + 1}`),
    borrowerEmail: entry?.borrowerEmail ? String(entry.borrowerEmail) : undefined,
    borrowedAt: String(entry?.borrowedAt ?? new Date().toISOString()),
    dueAt: String(entry?.dueAt ?? new Date().toISOString()),
    returnedAt: entry?.returnedAt ? String(entry.returnedAt) : undefined,
    status: isBorrowStatus(entry?.status) ? entry.status : "returned",
    conditionOnReturn: isBookCondition(entry?.conditionOnReturn)
      ? entry.conditionOnReturn
      : undefined,
    notes: entry?.notes ? String(entry.notes) : undefined,
  }))

  const conditionReviews: ConditionReview[] = rawConditionReviews.map((review, index) => ({
    reviewerName: String(review?.reviewerName ?? `Reader ${index + 1}`),
    rating:
      typeof review?.rating === "number" && Number.isFinite(review.rating)
        ? Math.max(1, Math.min(5, review.rating))
        : 4,
    condition: isBookCondition(review?.condition) ? review.condition : "good",
    review: String(review?.review ?? "No written review"),
    createdAt: String(review?.createdAt ?? new Date().toISOString()),
  }))

  return {
    id: String(book.id ?? book._id ?? book.isbn ?? book.title ?? book.name ?? ""),
    title: String(book.title ?? book.name ?? "Untitled Book"),
    author: String(book.author ?? "Unknown Author"),
    isbn: String(book.isbn ?? ""),
    college: getCollegeName(book.college),
    description: book.description,
    category: book.category,
    publisher: book.publisher,
    publishedYear: book.publishedYear,
    rating: typeof book.rating === "number" ? book.rating : undefined,
    availability: normalizeAvailability(book.availability),
    borrowPolicy,
    borrowHistory,
    conditionReviews,
  }
}

export function normalizeBooks(books: RawBook[]): Book[] {
  return books.map(normalizeBook)
}